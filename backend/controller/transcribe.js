const { SpeechClient } = require("@google-cloud/speech");
const dotenv = require("dotenv");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

dotenv.config();

const client = new SpeechClient({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  },
});

const transcribe = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  console.log("Received file:", req.file.originalname, req.file.size, "bytes");

  // Convert WebM to FLAC
  const inputStream = Readable.from(req.file.buffer);
  const chunks = [];

  ffmpeg(inputStream)
    .outputFormat("flac")
    .on("data", (chunk) => chunks.push(chunk))
    .on("end", async () => {
      const flacBuffer = Buffer.concat(chunks);
      console.log("Converted audio size:", flacBuffer.length, "bytes");

      // Send to Google Speech API
      const audio = { content: flacBuffer.toString("base64") };
      const config = {
        encoding: "FLAC",
        sampleRateHertz: 16000, // Adjust according to your input
        languageCode: "en-US",
      };

      try {
        const [response] = await client.recognize({ audio, config });
        const transcript = response.results
          .map((result) => result.alternatives[0].transcript)
          .join(" ");

        res.json({ transcript });
      } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ error: "Speech recognition failed" });
      }
    })
    .on("error", (err) => {
      console.error("FFmpeg Error:", err);
      res.status(500).json({ error: "Audio conversion failed" });
    })
    .run();
};

module.exports = { transcribe };
