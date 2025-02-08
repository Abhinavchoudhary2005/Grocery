const express = require("express");
const { ocr } = require("../controller/ocr");

const router = express.Router();

router.route("/").post(ocr);

module.exports = router;
