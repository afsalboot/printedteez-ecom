const { cloudinary } = require("../config/cloudinary.js");
const User = require("../models/User.js");
const crypto = require("crypto");
const argon2 = require("argon2");
const sendEmail = require("../config/mailer.js");
const templates = require("../utils/emailTemplates.js");

// helper: hash token
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ADMIN: Get all users

const getAllProfiles = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password"
    );
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

// USER: Get my profile

const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

// USER: Update profile + image

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Logged-in user's ID (from JWT middleware)
    const updates = {};

    // Update allowed fields
    if (req.body.name) updates.name = req.body.name;
    if (req.body.mobile) updates.mobile = req.body.mobile;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.verified !== undefined) updates.verified = req.body.verified;

    // If a profile image was uploaded
    if (req.file) {
      const base64 = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(base64, {
        folder: `users/${userId}`,
        transformation: [{ width: 500, crop: "limit" }],
      });

      updates.profileImageUrl = result.secure_url;
    }

    // Update user by logged-in user's ID
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      message: "Error updating profile",
      error: err.message,
    });
  }
};

// ADMIN: Delete any user

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // delete profile image if exists
    if (user.profileImageUrl) {
      const publicId = user.profileImageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader
        .destroy(`users/${user._id}/${publicId}`)
        .catch(() => {});
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

// USER: Delete my account

const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profileImageUrl) {
      const publicId = user.profileImageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader
        .destroy(`users/${user._id}/${publicId}`)
        .catch(() => {});
    }

    await user.deleteOne();
    res.json({ message: "Your account has been deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: err.message });
  }
};

// USER: Change password

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Please fill all fields" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Old password incorrect" });

    user.password = await argon2.hash(newPassword);
    await user.save();

    // send confirmation email
    try {
      const html = templates.passwordChanged(user.name);
      await sendEmail(user.email, "Password Changed Successfully", html);
    } catch {}

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error changing password", error: err.message });
  }
};

// USER: Request reset link

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        message: "If this email exists, a reset link was sent",
      });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = hashToken(token);
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // valid 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${user.email}`;
    const html = templates.resetPassword(user.name, resetLink);
    await sendEmail(user.email, "Password Reset Request", html);

    res.json({ message: "If this email exists, a reset link was sent" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error requesting password reset", error: err.message });
  }
};

// USER: Reset password

const resetPassword = async (req, res) => {
    console.log(req.body)
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid token or email" });

    const tokenHash = hashToken(token);
    if (user.resetPasswordToken !== tokenHash)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (user.resetPasswordExpires < Date.now())
      return res.status(400).json({ message: "Token expired" });

    user.password = await argon2.hash(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    try {
      const html = templates.passwordResetSuccess(user.name);
      await sendEmail(user.email, "Password Reset Successful", html);
    } catch {}

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};

module.exports = {
  getAllProfiles,
  getProfileById,
  updateUserProfile,
  deleteUser,
  deleteMyAccount,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
