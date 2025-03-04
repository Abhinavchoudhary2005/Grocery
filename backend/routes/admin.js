const express = require("express");
const { uploadMulter, uploadProduct } = require("../controller/upload"); // ✅ Correct Import
const { removeProduct } = require("../controller/remove");
const { userIsAuth } = require("../controller/userIsAuth");

const router = express.Router();

router.route("/").get(userIsAuth);
router
  .route("/upload/product")
  .post(uploadMulter.single("image"), uploadProduct);
router.route("/remove/product/:productId").delete(removeProduct);

module.exports = router;
