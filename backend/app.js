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
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));
app.use(checkForAuth);

// ROUTES
app.use("/admin", admin);
app.use("/images", express.static(path.join(__dirname, "/upload/images")));
app.use("/api", api);
app.use("/user", user);
app.use("/cart", cart);
app.use("/token", token);
app.use("/ocr", ocr);

app.post("/vertex-ai", async (req, res) => {
  try {
    const { detectedText, allProductNames } = req.body;
    if (!detectedText || !Array.isArray(allProductNames)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    console.log("📩 Received Request:", { detectedText, allProductNames });

    const prompt = `Translate the grocery list to English and match it to available products. Extract structured data in [[quantity, name, unit], ...] format if the available unit is in kg and user given in grams convert the grams in kg if the available unit is in grams and user given in kg convert the kg in grams and adjust the qantity accordingly ensure quantity does not exceed 100 like 100kg or more. if the given quanity is like 1 kg but we have available product in 500 grams ensure quantity 2 for 500 grams and send it in grams only. at the end it should match the provided items in store. in unit provide how much of what unit like 500g or 1kg or 1 dozen according to matches packaged item in the store. only provide the array no text before after only array. Grocery List: "${detectedText}". Available products: ${JSON.stringify(
      allProductNames
    )}`;

    console.log("📝 Generated Prompt:", prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    console.log("📡 Gemini API Response Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Gemini API Error:", errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    let aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Clean the response if it's wrapped in a code block
    aiResponse = aiResponse.replace(/```json|```/g, "").trim();

    console.log("✅ AI Extracted Data:", aiResponse);

    try {
      const parsedResponse = JSON.parse(aiResponse);
      res.json(parsedResponse);
    } catch (error) {
      console.error("❌ JSON Parsing Error:", error);
      res
        .status(500)
        .json({ error: "Invalid AI response format", rawResponse: aiResponse });
    }
  } catch (error) {
    console.error("❌ Processing Error:", error);
    res
      .status(500)
      .json({ error: "Failed to process text", details: error.message });
  }
});

// 🛑 Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).send("Something broke!");
});

// 🚀 START THE SERVER
const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on Port ${PORT} ...`);
});
