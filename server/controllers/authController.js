const User = require("../models/User.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken.js");
const sendEmail = require("../config/mailer.js");
const templates = require("../utils/emailTemplates.js");

const isEmailVerificationRequired = () =>
  String(process.env.REQUIRE_EMAIL_VERIFICATION || "false").toLowerCase() ===
  "true";

// SIGNUP
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cleanEmail = email?.toLowerCase();
    const cleanMobile = mobile ? Number(mobile) : undefined;

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
    const requireVerification = isEmailVerificationRequired();

    const user = await User.create({
      name,
      email: cleanEmail,
      mobile: cleanMobile,
      password: hashedPassword,
      verified: !requireVerification,
    });

    if (cleanEmail && requireVerification) {
      const verifyToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const backendUrl =
        process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const verifyLink = `${backendUrl}/api/auth/verify-email?token=${verifyToken}`;

      await sendEmail(
        cleanEmail,
        "Verify your PrintedTeez account",
        templates.verifyEmail(name, verifyLink)
      );

      return res.status(201).json({
        message: "Registration successful. Please verify your email.",
        requiresVerification: true,
        verifyLink:
          process.env.NODE_ENV !== "production" ? verifyLink : undefined,
      });
    }

    return res.status(201).json({
      message: "Registration successful. You can now log in.",
      requiresVerification: false,
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
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";

  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect(`${frontendUrl}/verify-failed`);
    }

    if (user.verified) {
      return res.redirect(`${frontendUrl}/already-verified`);
    }

    user.verified = true;
    await user.save();

    await sendEmail(
      user.email,
      "Welcome to PrintedTeez",
      templates.welcomeEmail(user.name)
    );

    return res.redirect(`${frontendUrl}/verify-success`);
  } catch (error) {
    return res.redirect(`${frontendUrl}/verify-failed`);
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, email, mobile, password } = req.body;

    const identifier = emailOrMobile ?? email ?? mobile;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let query;

    if (String(identifier).includes("@")) {
      query = { email: String(identifier).toLowerCase() };
    } else {
      query = { mobile: Number(String(identifier).replace(/\D/g, "")) };
    }

    const user = await User.findOne(query).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await argon2.verify(user.password, password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    if (isEmailVerificationRequired() && !user.verified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        usedCoupons: user.usedCoupons || [],
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

module.exports = { registerUser, loginUser, verifyEmail };
