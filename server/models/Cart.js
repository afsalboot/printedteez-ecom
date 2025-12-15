const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: { type: String, required: true },
    color: { type: String },              // 👈 NEW (optional)
    qty: { type: Number, default: 1 },
    price: { type: Number, required: true }, // snapshot price
    image: { type: String },              // 👈 NEW
    title: { type: String },              // 👈 optional, for convenience
  },
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
