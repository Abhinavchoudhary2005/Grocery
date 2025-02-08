const express = require("express");
const { tokenPayload } = require("../controller/token");

const router = express.Router();

router.route("/").post(tokenPayload);

module.exports = router;
