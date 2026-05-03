const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title: String,
  size: String,
  color: String,
  price: Number,
  qty: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [ItemSchema],
    subTotal: Number,
    finalAmount: Number,

    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },

    couponApplied: {
      code: String,
      discountAmount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "upi"],
      required: true,
    },

    paymentInfo: {
      paid: { type: Boolean, default: false },
      txnId: String,
      stripePaymentIntentId: String,
      upiTxnId: String,
    },

    tracking: {
      carrier: { type: String, default: "" },
      trackingId: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
      updatedAt: { type: Date, default: null },
    },

    invoiceHtml: String,

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

OrderSchema.index(
  { cancelledAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);

module.exports = mongoose.model("Order", OrderSchema);
