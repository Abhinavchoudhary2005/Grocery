const express = require("express");
const multer = require("multer");
const { uploadProduct } = require("../controller/upload");
const { removeProduct } = require("../controller/remove");
const { userIsAuth } = require("../controller/userIsAuth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMulter = multer({ storage });

const router = express.Router();

router.route("/").get(userIsAuth);
router
  .route("/upload/product")
  .post(uploadMulter.single("image"), uploadProduct);
router.route("/remove/product/:productId").delete(removeProduct);

module.exports = router;
