const mongoose = require("mongoose");

const SavedAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UsedCouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    usedAt: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { _id: false }
);

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
    savedAddresses: [SavedAddressSchema],
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    usedCoupons: [UsedCouponSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
