const bcrypt = require("bcrypt");
const User = require("../modules/user");
const { createTokenForUser } = require("../utils/token");

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

const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Validate role
    const validRoles = ["USER", "SELLER"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be either 'USER' or 'SELLER'" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      salt,
      role, // Save the role
    });

    const token = createTokenForUser(newUser);
    res.status(201).json({ uid: token, redirectUrl: "/" });
  } catch (error) {
    res.status(500).json({ error: `Error creating user: ${error.message}` });
  }
};

module.exports = { login, signUp };
