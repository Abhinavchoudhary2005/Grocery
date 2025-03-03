const { SpeechClient } = require("@google-cloud/speech");
const dotenv = require("dotenv");
const { PassThrough } = require("stream");
const ffmpeg = require("fluent-ffmpeg");

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
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const audioBuffer = req.file.buffer;

    // Convert to Linear16 format using ffmpeg
    const convertedAudio = await convertToLinear16(audioBuffer);

    const request = {
      audio: { content: convertedAudio.toString("base64") },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    res.json({ transcription });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: "Failed to process audio" });
  }
};

// Convert audio to LINEAR16 format
const convertToLinear16 = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const passthrough = new PassThrough();
    const outputBuffer = [];

    const ffmpegProcess = ffmpeg()
      .input(passthrough)
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("error", (error) => reject(error));

    // Capture the output into the buffer
    ffmpegProcess
      .pipe(new PassThrough())
      .on("data", (chunk) => outputBuffer.push(chunk))
      .on("end", () => resolve(Buffer.concat(outputBuffer)));

    passthrough.end(inputBuffer);
  });
};

module.exports = { transcribe };
