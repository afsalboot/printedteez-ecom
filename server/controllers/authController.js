const User = require("../models/User.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken.js");
const sendEmail = require("../config/mailer.js");
const templates = require("../utils/emailTemplates.js");

// SIGNUP
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await argon2.hash(password);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashed,
    });

    let token;

    if (email) {
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      await sendEmail(
        email,
        "Verify your PrintedTeez account",
        templates.verifyEmail(name, link)
      );
    }

    return res.status(200).json({
      message: "User registered. Check email for verification link.",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verified = true;
    await user.save();

    await sendEmail(
      user.email,
      "Welcome to PrintedTeez",
      templates.welcomeEmail(user.name)
    );

    return res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, email, mobile, password } = req.body;

    const identifier = (emailOrMobile ?? email ?? mobile);
    if (!identifier || !password)
      return res.status(400).json({ message: "Missing required fields" });

    let query;

    if (identifier.includes("@"))
      query = { email: identifier.toLowerCase() };
    else
      query = { mobile: Number(identifier.replace(/\D/g, "")) };

    const user = await User.findOne(query).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await argon2.verify(user.password, password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    if (!user.verified)
      return res.status(403).json({ message: "Email not verified" });

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = { registerUser, loginUser, verifyEmail };
