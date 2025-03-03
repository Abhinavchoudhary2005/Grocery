const express = require("express");
const { vertexAi } = require("../controller/vertexAi");

const router = express.Router();

router.route("/").post(vertexAi);

module.exports = router;
