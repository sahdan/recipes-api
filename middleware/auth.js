const jwt = require("jsonwebtoken");
const ONE_DAY = 86400;

function auth(req, res, next) {
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

  next();

  function isTokenExpired() {
    return (new Date().getTime() / 1000) - user.iat > ONE_DAY;
  }
}

module.exports = auth;
