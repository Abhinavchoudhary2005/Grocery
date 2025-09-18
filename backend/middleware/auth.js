const { verifyTokenForUser } = require("../utils/token");

const checkForAuth = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return next();
  }

  try {
    const verifiedUser = await verifyTokenForUser(token);
    req.user = verifiedUser;
    next();
  } catch (error) {
    res.status(401).send({
      error: "Invalid token. Please login again",
      redirectUrl: "/login",
    });
  }
};

module.exports = { checkForAuth };
