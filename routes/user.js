const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const yup = require("yup");

// Use createPool to enable multiple database connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host : "localhost",
  database : "db_resep",
  user: "root",
  password: ""
});

/**
 * Level List
 * 1  Contributor, can Read and Submit Recipe and give ratings
 * 2  Admin, like Contributor + can delete
*/

const schemaRegister = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
  fullname: yup.string().required()
})

const schemaLogin = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required()
})

/** Registrasi awal untuk mendapatkan Akun */
router.post("/register", async function(req,res){
  const form = await schemaRegister.validate(req.body, {abortEarly:false});
  pool.getConnection(async function(err, conn) {
    if(err) throw err;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(form.password, salt);
    const q = `insert into t_user values('${form.username}',
      '${hashed}', '${form.fullname}', 1)`;
    conn.query(q, function(err, result) {
      conn.release();
      if(err) throw err;
      res.status(201).send("Registration Successful");
    });
  })
});

/** Login ke akun untuk mendapatkan token */
router.post("/login",async function(req,res){
  const form = await schemaLogin.validate(req.body, {abortEarly:false});
  pool.getConnection(async function(err, conn) {
    if(err) throw err;
    const q = `select * from t_user where username ='${form.username}'`;
    conn.query(q, async function(err, result) {
      conn.release();
      if(err) throw err;
      if(result.length<=0){
        return res.status(400).send("Invalid username or password!");
      }
      else {
        const user = result[0];
        if(await bcrypt.compare(form.password, user["password"])) {
          const token = jwt.sign({
            "username": user.username,
            "level":user.level,
          },"iniAdalahKey");
          res.status(200).send(token);
        } else {
          return res.status(400).send("Invalid username or password!");
        }
      }
    });
  })
});

module.exports = router;
