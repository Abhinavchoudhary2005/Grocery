import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const googleResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            },
          ],
        }),
      }
    );

    const data = await googleResponse.json();

    res.json(data);
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: "Something went wrong with OCR" });
  }
});

export default router;
