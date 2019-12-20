const express = require("express");
const router = express.Router();
const request = require("request");
const yup = require("yup");
const mysql = require('mysql');
const auth = require("../middleware/auth");
const authadmin = require("../middleware/authadmin");
const jwt = require("jsonwebtoken");
const ONE_DAY = 86400;

/* TO DO:
* Tambahkan Fitur tambah dan hapus resep.
*/

const LOCAL_RECEIPT_START_ID = 1500000;

const cuisineList = ['african', 'chinese', 'japanese', 'korean', 'vietnamese',
  'thai', 'indian','british', 'irish', 'french', 'italian', 'mexican', 'spanish',
  'middle eastern', 'jewish', 'american', 'cajun', 'southern', 'greek', 'german',
  'nordic', 'eastern european', 'caribbean', 'latin american']
const dietList = ['pescetarian', 'lacto vegetarian', 'ovo vegetarian', 'vegan',
  'vegetarian', 'halal', 'kosher'];
const typeList = ['main course', 'side dish', 'dessert', 'appetizer', 'salad',
  'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'drink'];

const schemaCariResep = yup.object().shape({
  query: yup.string().required(),
  cuisine: yup.string().lowercase().oneOf(cuisineList),
  diet: yup.string().lowercase().oneOf(dietList),
  excludeIngredients: yup.string(),
  intolerances: yup.string(),
  number: yup.number(),
  type: yup.string().oneOf(typeList),
  instructionsRequired: yup.boolean()
});

const schemaTambahResep = yup.object().shape({
  servings: yup.number().required(),
  creditText: yup.string().required(),
  title: yup.string().required(),
  readyInMinutes: yup.number().required(),
  image: yup.string().required(),
  instructions: yup.string().required(),
  ingredients: yup.array(yup.object().shape({
    name: yup.string().required(),
    amount: yup.number().required(),
    unit: yup.string().required()
  }))
});

const schemaCariResepLokal = yup.object().shape({
  query: yup.string().required(),
  number: yup.number()
});

const schemaResepAcak = yup.object().shape({
  number: yup.number(),
  tags: yup.string()
});

const schemaRating = yup.object().shape({
  rate: yup.number().min(1).max(5)
})

// Use createPool to enable multiple database connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host : "localhost",
  database : "db_resep",
  user: "root",
  password: "",
  multipleStatements: true
});

/** Tidak jadi dipakai
router.get("/", function(req,res){
  request.post({
    url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
    form: {
      key: "trnsl.1.1.20191024T044607Z.17f392b6643c9fcc.f380fe5485b7f83480fef44e7443dd900abcb512",
      text: "Meja merah memakan kursi",
      lang: "id-en"
    }
  }, function (error, response, body) {
    res.send(body);
  });

});
*/

/** Mencari resep berdasarkan nama masakan dengan 1 filter opsional */
router.get("/cari", auth, async function(req,res){
  try{
    const reqbody = await schemaCariResep.validate(req.body, {abortEarly:false});

    const qs = {
      cuisine: reqbody.cuisine,
      excludeIngredients: reqbody.excludeIngredients,
      intolerances: reqbody.intolerances,
      number: reqbody.number,
      type: reqbody.type,
      instructionsRequired: reqbody.instructionsRequired,
      query: reqbody.query
    }

    cekIfDietHasHalalOrKosher(reqbody, qs);

    var options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search',
      qs: qs,
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': '[ENTER YOUR RAPIDAPI KEY HERE]'
      }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      // console.log(qs);
      bodyJSON = JSON.parse(body);
      if (bodyJSON.results.length > 0) {
        for (const receipt of bodyJSON.results) {
          receipt.image = bodyJSON.baseUri + receipt.image
        }
        res.send(bodyJSON.results);
      } else {
        return res.status(404).send("No Receipt Found");
      }
    });
  } catch(err) {
    return res.status(400).send(err["errors"].join("\n"));
  }
});

/** Mencari resep di DB lokal berdasarkan nama masakan  */
router.get("/cariLokal", auth, async function(req,res){
  try{
    const reqbody = await schemaCariResepLokal.validate(req.body, {abortEarly:false});

    pool.getConnection(async function(err, conn) {
      if(err) throw err;

      let limit = '';

      if (typeof reqbody.number != "undefined") {
        limit = 'LIMIT ' + reqbody.number;
      }

      const q = `select id,title,readyInMinutes,image,rating from v_resep where title like
        '%${reqbody.query.toLowerCase()}%' and status = 1 ${limit}`;
      conn.query(q, function(err, result) {
        conn.release();
        if(err) throw err;
        if(result.length<=0){
          return res.status(404).send("No Receipt Found");
        } else {
          return res.status(200).send(result);
        }

      });
    })
  } catch(err) {
    return res.status(400).send(err["errors"].join("\n"));
  }
});

/** Mencari resep yang mirip dengan ID resep */
router.get("/mirip/:id", auth, function(req,res){
  var options = {
    method: 'GET',
    url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/'+req.params.id+'/similar',
    headers: {
      'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
      'x-rapidapi-key': '[ENTER YOUR RAPIDAPI KEY HERE]'
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
  });
});

/** Mendapatkan resep masakan secara acak dengan tag opsional */
router.get("/acak", auth, async function(req, res){
  try{
    const reqbody = await schemaResepAcak.validate(req.body, {abortEarly:false});

    var options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random',
      qs: reqbody,
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': '[ENTER YOUR RAPIDAPI KEY HERE]'
      }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      // TODO: Merge the imageURLs from result with the baseUri
      res.send(body);
    });
  } catch(err) {
    return res.status(400).send(err["errors"].join("\n"));
  }
});

/** Mendapatkan detail resep masakan berdasarkan ID resep */
router.get("/detail/:id", auth, function(req,res){

  if (parseInt(req.params.id) > LOCAL_RECEIPT_START_ID) {
    let resep = {}
    try{
      pool.getConnection(async function(err, conn) {
        if(err) throw err;

        let q = `select * from v_resep where id = ${req.params.id} and status = 1`;
        conn.query(q, function (err, result) {
          if (err)
            throw err;
          if (result.length <= 0) {
            return res.status(404).send("No Receipt Found");
          }
          else {
            resep = result[0];
          }

          q = `select rb.name,rb.amount,rb.unit from t_resep_bahan rb
          where rb.id_resep = ${req.params.id}`;

          conn.query(q, function(err, result) {
            conn.release();
            if(err) throw err;
            if(result.length>0){
              resep.ingredients = result;
            }

            return res.status(200).send(resep);
          });
        });


      });
    } catch(err) {
      return res.status(400).send(err["errors"].join("\n"));
    }
  } else {
    var options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/'+req.params.id+'/information',
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': '[ENTER YOUR RAPIDAPI KEY HERE]'
      }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      res.send(body);
    });
  }

});

/** Mendapatkan daftar bahan resep masakan berdasarkan ID resep */
router.get("/bahan/:id", auth, function(req,res){
  if (parseInt(req.params.id) > LOCAL_RECEIPT_START_ID) {
    try{
      pool.getConnection(async function(err, conn) {
        if(err) throw err;

        const q = `select rb.name,rb.amount,rb.unit from t_resep_bahan rb
          where rb.id_resep = ${req.params.id}`;
        conn.query(q, function(err, result) {
          conn.release();
          if(err) throw err;
          if(result.length<=0){
            return res.status(404).send("No Receipt Found");
          } else {
            return res.status(200).send(result);
          }
        });
      });
    } catch(err) {
      return res.status(400).send(err["errors"].join("\n"));
    }
  } else {
    var options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/'+req.params.id+'/ingredientWidget.json',
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': '[ENTER YOUR RAPIDAPI KEY HERE]'
      }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      res.send(body);
    });
  }

});

router.post("/tambah", auth, async function(req, res){
  try{
    const reqbody = await schemaTambahResep.validate(req.body, {abortEarly:false});

    const qs = {
      servings: reqbody.servings,
      creditText: reqbody.creditText,
      title: reqbody.title,
      readyInMinutes: reqbody.readyInMinutes,
      image: reqbody.image,
      instructions: reqbody.instructions
    }

    pool.getConnection(async function(err, conn) {
      if (err) throw err;

      let id;
      let q = `select max(id) as id from t_resep`;
      let message = '';

      conn.query(q, function(err, result) {
        if(err) throw err;
        id = result[0].id + 1;

        q = `insert into t_resep (id, servings, creditText, title, readyInMinutes,
            image, instructions) values (${id}, ${reqbody.servings},
            '${reqbody.creditText}','${reqbody.title}', ${reqbody.readyInMinutes},
            '${reqbody.image}', '${reqbody.instructions}')`;
        conn.query(q, function(err, result) {
          if(err) throw err;
          message = "1 resep inserted\n";

          let ingredientsArr = []

          for (let i = 0; i < reqbody.ingredients.length; i++) {
            reqbody.ingredients[i].id_resep = id;
            let arr = [
              reqbody.ingredients[i].id_resep,
              reqbody.ingredients[i].name,
              reqbody.ingredients[i].amount,
              reqbody.ingredients[i].unit
            ]
            ingredientsArr.push(arr)
          }

          q = `insert into t_resep_bahan (id_resep, name, amount, unit) values ?`;
          conn.query(q, [ingredientsArr], function(err, result) {
            if(err) throw err;
            message += "Number of bahan resep inserted: " + result.affectedRows;

            return res.status(201).send(message);
          })
          conn.release();
        });
      });
    })
  } catch(err) {
    return res.status(400).send(err["errors"].join("\n"))
  }
})

router.delete("/:id", authadmin, async function(req, res){

  try {

    pool.getConnection(async function(err, conn) {
      if(err) throw err;
      if (parseInt(req.params.id) > LOCAL_RECEIPT_START_ID) {
        let q = `update t_resep set status = 0 where id = ${req.params.id}`;
        conn.query(q, function (err, result) {
          conn.release();
          if (err) throw err;
          if (result.affectedRows <= 0) {
            return res.status(404).send("No Receipt Found");
          }
          else {
            return res.status(200).send("Receipt ID " + req.params.id + " successfully deleted");
          }
        });
      } else {
        return res.status(404).send("Receipt ID is not part of local DB");
      }
    })
  } catch(err) {
    return res.status(400).send(err["errors"].join("\n"));
  }
})

router.post("/rate/:id", async function(req, res){

  const token = req.header("x-auth-token")
  if (!token) {
    return res.status(401).send("No Token Found");
  }

  let user = {}

  try {
    user = jwt.verify(token, "iniAdalahKey");
  } catch (ex) {
    return res.status(400).send("Invalid Token");
  }

  // Check if token expired
  if (isTokenExpired()) {
    return res.status(400).send("Token Expired")
  }

  function isTokenExpired() {
    return (new Date().getTime() / 1000) - user.iat > ONE_DAY;
  }

  try {

    const reqbody = await schemaRating.validate(req.body, {abortEarly:false});

    pool.getConnection(async function(err, conn) {
      if(err) throw err;
      if (parseInt(req.params.id) > LOCAL_RECEIPT_START_ID) {

        let qu = `select id from t_resep where id = '${req.params.id}'`;

        conn.query(qu, function(err, result) {
          if(err) throw err;
          if(result.length <= 0) {
            return res.status(404).send("Receipt ID " + req.params.id + " Not Found in Local DB")
          } else {
            let q = `insert into t_rating values ('${user.username}', ${req.params.id}, ${reqbody.rate})`;
            conn.query(q, function (err, result) {
              conn.release()
              if (err) throw err;
              else {
                const message = "Rating " + reqbody.rate + "of Receipt ID " + req.params.id + " is successfully submitted";

                return res.status(201).send(message);
              }
            });
          }
        });


      } else {
        return res.status(404).send("Receipt ID is not part of local DB");
      }
    })
  } catch(err) {
    return res.status(400).send(err["errors"].join("\n"));
  }



})

module.exports = router;

// Sumber https://food.detik.com/info-halal/d-1345568/halal-versus-kosher
// Add some intelorance ingridents if diet is halal or kosher
function cekIfDietHasHalalOrKosher(reqbody, qs) {
  if (isDefined(reqbody.diet)) {
    if (reqbody.diet == 'halal') {
      if (isDefined(reqbody.intolerances)) {
        qs.intolerances += ",wine,alcohol,pork,ham";
      }
      else {
        qs.intolerances = "wine,alcohol,pork,ham";
      }
    }
    else if (reqbody.diet == 'kosher') {
      if (isDefined(reqbody.intolerances)) {
        qs.intolerances += ",rabbit,shellfish,eel,pork,ham";
      }
      else {
        qs.intolerances = ",rabbit,shellfish,eel,pork,ham";
      }
    }
    else {
      qs.diet = reqbody.diet;
    }
  }
}

function isDefined(param) {
  return typeof param != 'undefined';
}
