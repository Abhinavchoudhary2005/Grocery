const express = require("express");
const {
  emailSendOTP,
  phoneSendOTP,
  aadharSendOTP,
  emailVerifyOTP,
  phoneVerifyOTP,
  aadharVerifyOTP,
} = require("../controller/otp");

const router = express.Router();

router.route("/email-send-otp").post(emailSendOTP);
router.route("/phone-send-otp").post(phoneSendOTP);
router.route("/aadhar-send-otp").post(aadharSendOTP);
router.route("/email-verify-otp").post(emailVerifyOTP);
router.route("/phone-verify-otp").post(phoneVerifyOTP);
router.route("/aadhar-verify-otp").post(aadharVerifyOTP);

module.exports = router;
