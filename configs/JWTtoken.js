const jwt = require("jsonwebtoken");

const jwtKey = process.env.JWT_KEY;

const generateToken = (id) => {
  return jwt.sign({ id }, jwtKey, { expiresIn: "20d" });
};

module.exports = generateToken;
