const express = require("express");
const { transcribe } = require("../controller/transcribe");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit: 50MB
});

const router = express.Router();

router.post("/", upload.single("audio"), transcribe);

module.exports = router;
