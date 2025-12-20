const User = require("../models/User.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken.js");
const sendEmail = require("../config/mailer.js");
const templates = require("../utils/emailTemplates.js");

// SIGNUP
// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize inputs
    const cleanEmail = email?.toLowerCase();
    const cleanMobile = mobile ? Number(mobile) : undefined;

    // Check existing user
    const exists = await User.findOne({
      $or: [
        cleanEmail ? { email: cleanEmail } : null,
        cleanMobile ? { mobile: cleanMobile } : null,
      ].filter(Boolean),
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      name,
      email: cleanEmail,
      mobile: cleanMobile,
      password: hashedPassword,
      verified: false,
    });

    // EMAIL VERIFICATION
    if (cleanEmail) {
      const verifyToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // ⏱ match email text
      );

      const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verifyToken}`;

      await sendEmail(
        cleanEmail,
        "Verify your PrintedTeez account",
        templates.verifyEmail(name, verifyLink)
      );
    }

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify-failed`);
    }

    if (user.verified) {
      return res.redirect(`${process.env.FRONTEND_URL}/already-verified`);
    }

    user.verified = true;
    await user.save();

    await sendEmail(
      user.email,
      "Welcome to PrintedTeez",
      templates.welcomeEmail(user.name)
    );

    return res.redirect(`${process.env.FRONTEND_URL}/verify-success`);
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/verify-failed`);
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
