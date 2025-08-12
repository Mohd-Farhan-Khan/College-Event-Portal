const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES, ...options });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { JWT_SECRET, signToken, verifyToken };
