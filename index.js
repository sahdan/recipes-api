const express = require("express");
const app = express();
const resep = require("./routes/resep");
const user = require("./routes/user");
const yup = require("yup");


app.use(express.json());
app.use("/api/resep",resep);
app.use("/api/user",user);

app.listen(3000, function(){
  console.log("listening to port 3000");
})
