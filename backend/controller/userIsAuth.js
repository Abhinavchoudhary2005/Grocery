const userIsAuth = (req, res) => {
  res.status(201).send({ isAuthenticated: true });
};

module.exports = { userIsAuth };
