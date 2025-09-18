const { verifyTokenForUser } = require("../utils/token");

const tokenPayload = async (req, res) => {
  const { token } = req.body;
  const user = verifyTokenForUser(token);
  res.status(202).send({ user });
};

module.exports = { tokenPayload };
