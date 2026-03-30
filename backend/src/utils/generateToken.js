const jwt = require("jsonwebtoken");

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "blisss-secret", {
    expiresIn: "7d",
  });

module.exports = generateToken;
