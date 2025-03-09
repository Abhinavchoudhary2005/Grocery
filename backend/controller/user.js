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
    let { name, email, password, phone, aadhar, role } = req.body;

    // Trim input values
    name = name?.trim();
    email = email?.trim();
    phone = phone?.trim();
    aadhar = aadhar?.trim();

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password)
      return res.status(400).json({ error: "Password is required" });

    const validRoles = ["USER", "SELLER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    if (role === "SELLER") {
      if (!phone)
        return res.status(400).json({ error: "Phone number is required" });
      // if (!aadhar)
      //   return res.status(400).json({ error: "Aadhar number is required" });
    }

    // Use Promise.all to speed up hashing
    const [salt, hashedPassword] = await Promise.all([
      bcrypt.genSalt(10),
      bcrypt.hash(password, 10),
    ]);

    const newUser = await User.create(
      role === "SELLER"
        ? { name, email, phone, password: hashedPassword, salt, role }
        : { name, email, password: hashedPassword, salt, role }
    );

    const token = createTokenForUser(newUser);
    res.status(201).json({ uid: token, redirectUrl: "/" });
  } catch (error) {
    res.status(500).json({ error: `Error signing up: ${error.message}` });
  }
};

module.exports = { login, signUp };
