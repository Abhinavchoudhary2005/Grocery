const express = require("express");
const { transcribe } = require("../controller/transcribe");

const router = express.Router();

router.route("/").post(transcribe);

module.exports = router;
