const bcrypt = require("bcrypt");
const User = require("../modules/user");
const { createTokenForUser } = require("../utils/token");
const nodemailer = require("nodemailer");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password incorrect" });
    }

    const token = createTokenForUser(user);
    res.status(200).json({ uid: token, redirectUrl: "/" });
  } catch (error) {
    res.status(500).json({ error: `Error logging in user: ${error.message}` });
  }
};

const otpStorage = {};

const sendOTP = async (email, otp) => {
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
};

const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const validRoles = ["USER", "SELLER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStorage[email] = { otp, expiresAt: Date.now() + 300000 }; // Valid for 5 minutes

    // Send OTP via email
    await sendOTP(email, otp);

    res
      .status(200)
      .json({ message: "OTP sent to your email. Verify to continue." });
  } catch (error) {
    res.status(500).json({ error: `Error signing up: ${error.message}` });
  }
};

// OTP Verification Endpoint
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, name, role } = req.body;

    if (!otpStorage[email] || otpStorage[email].otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP is correct, create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      salt,
      role,
    });

    delete otpStorage[email]; // Remove OTP after successful verification

    const token = createTokenForUser(newUser);
    res.status(201).json({ uid: token, redirectUrl: "/" });
  } catch (error) {
    res.status(500).json({ error: `Error verifying OTP: ${error.message}` });
  }
};

module.exports = { login, signUp, verifyOTP };
