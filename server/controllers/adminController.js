const argon = require("argon2");
const User = require("../models/User.js");
const generateToken = require("../utils/generateToken.js");

const createAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ role: "admin" });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = await User.create({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: await argon.hash(process.env.ADMIN_PASSWORD),
      role: "admin",
      verified: true,
      mobile: process.env.ADMIN_MOBILE,
    });

    return res.status(201).json({ message: "Admin created", email: admin.email });
  } catch (err) {
    res.status(500).json({ message: "Error creating admin", error: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await argon.verify(admin.password, password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(admin._id);

    return res.status(200).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
        verified: admin.verified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

module.exports = { createAdmin, loginAdmin };
