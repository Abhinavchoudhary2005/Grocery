const express = require("express");
const { displayProduct } = require("../controller/api");

const router = express.Router();

router.route("/product").get(displayProduct);

module.exports = router;
