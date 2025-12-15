const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    amount: { type: Number, required: true },

    minOrderValue: { type: Number, default: 0 },
    expiryDate: { type: Date },

    usageLimit: { type: Number, default: 0 },

    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
