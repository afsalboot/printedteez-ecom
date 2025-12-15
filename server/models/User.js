const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
      match: [/^\d{10,15}$/, "Invalid mobile number format"],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    verified: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    profileImageUrl: { type: String, default: "" },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
