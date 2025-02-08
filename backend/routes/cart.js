const express = require("express");
const {
  addToCart,
  getCart,
  removeProduct,
  getorder,
  order,
} = require("../controller/cart");

const router = express.Router();

router.route("/").get(getCart);
router.route("/addToCart").post(addToCart);
router.route("/removeProduct").post(removeProduct);
router.route("/order").post(order);
router.route("/getorder").get(getorder);

module.exports = router;
