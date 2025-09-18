const express = require("express");
const { chatbot } = require("../controller/chatbot");

const router = express.Router();

router.route("/").post(chatbot);

module.exports = router;
