const express = require("express");
const { login, signUp } = require("../controller/user");

const router = express.Router();

router.route("/login").post(login);
router.route("/signup").post(signUp);

module.exports = router;
