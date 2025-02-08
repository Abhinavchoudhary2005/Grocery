require("dotenv").config();

const jwt = require("jsonwebtoken");

const secret = process.env.SECRET;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    userSince: user.timestamps
  };

  const token = jwt.sign(payload, secret);
  return token;
}

function verifyTokenForUser(token) {
  if (!token) return null;
  const payload = jwt.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  verifyTokenForUser,
};
