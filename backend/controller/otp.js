const nodemailer = require("nodemailer");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

const emailOtpStorage = {};

setInterval(() => {
  const now = Date.now();
  for (const email in emailOtpStorage) {
    if (emailOtpStorage[email].expiresAt < now) {
      delete emailOtpStorage[email];
    }
  }
}, 60000); // Run every 60 seconds

const emailSendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    emailOtpStorage[email] = { otp, expiresAt: Date.now() + 300000 };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_USER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP for account verification is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "OTP sent to your email. Verify to continue." });
  } catch (error) {
    res.status(500).json({ error: `Error Sending otp: ${error.message}` });
  }
};

const phoneSendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: phone, channel: "sms" });
    res
      .status(200)
      .json({ message: "OTP sent to your phone. Verify to continue." });
  } catch (error) {
    res.status(500).json({ error: `Error Sending otp: ${error.message}` });
  }
};

const aadharSendOTP = async (req, res) => {};

const emailVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Fetch stored OTP before checking
    const storedOTP = emailOtpStorage[email];

    // If OTP is missing or expired, return an error
    if (!storedOTP) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Explicitly check if OTP has expired
    if (storedOTP.expiresAt < Date.now()) {
      delete emailOtpStorage[email];
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Verify OTP
    if (storedOTP.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    // Remove OTP after successful verification
    delete emailOtpStorage[email];

    res.status(201).json({ emailVerified: true });
  } catch (error) {
    res.status(500).json({ error: `Error verifying OTP: ${error.message}` });
  }
};

const phoneVerifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phone, code: otp });
    res.status(201).json({ phoneVerified: true });
    return verificationCheck.status === "approved";
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: `Error verifying OTP: ${error.message}` });
    return false;
  }
};

const aadharVerifyOTP = async (req, res) => {};

module.exports = {
  emailSendOTP,
  phoneSendOTP,
  aadharSendOTP,
  emailVerifyOTP,
  phoneVerifyOTP,
  aadharVerifyOTP,
};
