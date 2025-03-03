require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const { checkForAuth } = require("./middleware/auth");
const admin = require("./routes/admin");
const api = require("./routes/api");
const user = require("./routes/user");
const cart = require("./routes/cart");
const token = require("./routes/token");
const ocr = require("./routes/ocr");
const vertexAi = require("./routes/vertexAi");
const transcribe = require("./routes/transcribe");

// PORT
const PORT = process.env.PORT || 8000;

// SERVER
const app = express();

// CONNECTING MONGODB SERVER
mongoose
  .connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 60000,
    family: 4, // Use IPv4
  })
  .then(() => {
    console.log("✅ MongoDB connected...");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

// MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(checkForAuth);
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// ROUTES
app.use("/admin", admin);
app.use("/images", express.static(path.join(__dirname, "/upload/images")));
app.use("/api", api);
app.use("/user", user);
app.use("/cart", cart);
app.use("/token", token);
app.use("/ocr", ocr);
app.use("/vertex-ai", vertexAi);
app.use("/transcribe", transcribe);

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).send("Something broke!");
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on Port ${PORT} ...`);
});
