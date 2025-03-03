const express = require("express");
const { login, signUp, verifyOTP } = require("../controller/user");

const router = express.Router();

router.route("/login").post(login);
router.route("/signup").post(signUp);
router.route("/verify-otp").post(verifyOTP);

module.exports = router;
