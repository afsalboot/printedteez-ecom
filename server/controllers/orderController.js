// controllers/orderController.js
const mongoose = require("mongoose");
const sendEmail = require("../config/mailer.js");
const Coupon = require("../models/Coupon.js");
const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const templates = require("../utils/emailTemplates.js");
const generateInvoiceHtml = require("../utils/invoiceGenerator.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

// CREATE ORDER (COD / STRIPE / UPI)

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress = {}, couponCode, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!["cod", "stripe", "upi"].includes(paymentMethod))
      return res.status(400).json({ message: "Invalid payment method" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fill missing shipping details
    if (!shippingAddress.name) shippingAddress.name = user.name;
    if (!shippingAddress.phone)
      shippingAddress.phone = user.mobile?.toString() || "";

    // CALCULATE SUBTOTAL
    let subTotal = 0;
    const filledItems = [];

    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      const sizeObj = product.sizes.find((s) => s.size === it.size);
      if (!sizeObj)
        return res
          .status(400)
          .json({ message: `Size ${it.size} not available` });

      if (sizeObj.stock < it.qty)
        return res.status(400).json({
          message: `Insufficient stock for ${product.title} (${it.size})`,
        });

      const price = Number(sizeObj.price);
      const total = price * Number(it.qty);
      subTotal += total;

      // 👇 decide which image to store with the order
      const image =
        (it.image && typeof it.image === "string" && it.image.trim() !== "")
          ? it.image
          : Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "";

      filledItems.push({
        productId: product._id,
        title: product.title,
        size: it.size,
        price,
        qty: Number(it.qty),
        image, // 👈 store image snapshot on order item
      });
    }

    // APPLY COUPON
    let discountAmount = 0;
    let couponApplied = { code: null, discountAmount: 0 };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) return res.status(400).json({ message: "Invalid coupon" });
      if (!coupon.isActive)
        return res.status(400).json({ message: "Coupon disabled" });
      if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate))
        return res.status(400).json({ message: "Coupon expired" });
      if (coupon.minOrderValue && subTotal < coupon.minOrderValue)
        return res.status(400).json({ message: "Minimum order not met" });

      discountAmount =
        coupon.discountType === "percentage"
          ? (subTotal * coupon.amount) / 100
          : coupon.amount;

      couponApplied = { code: coupon.code, discountAmount };
    }

    const finalAmount = Math.max(0, subTotal - discountAmount);

    // ---------------------------------------------------------
    // CASE 1: CASH ON DELIVERY – CREATE ORDER IMMEDIATELY
    // ---------------------------------------------------------
    if (paymentMethod === "cod") {
      // Reduce stock immediately
      for (const it of filledItems) {
        await Product.updateOne(
          { _id: it.productId, "sizes.size": it.size },
          { $inc: { "sizes.$.stock": -it.qty } }
        );
      }

      const order = await Order.create({
        userId: req.user.id,
        items: filledItems,
        subTotal,
        finalAmount,
        shippingAddress,
        couponApplied,
        paymentMethod: "cod",
        paymentInfo: { paid: false },
        status: "processing",
      });

      return res.status(201).json({
        success: true,
        message: "Order placed successfully (COD)",
        order,
      });
    }

    // ---------------------------------------------------------
    // CASE 2: STRIPE CARD / UPI – CREATE PAYMENT INTENT ONLY
    // ---------------------------------------------------------
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "inr",
      amount: Math.round(finalAmount * 100),
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user.id.toString(),
        items: JSON.stringify(filledItems),
        couponCode: couponCode ? couponCode.toString() : "",
        subTotal: subTotal.toString(),
        finalAmount: finalAmount.toString(),
        intendedPaymentMethod: paymentMethod,
      },
    });

    // TEMP ORDER (not finalized until confirmOrder)
    const order = await Order.create({
      userId: req.user.id,
      items: filledItems,
      subTotal,
      finalAmount,
      shippingAddress,
      couponApplied,
      paymentMethod,
      status: "pending",
      paymentInfo: {
        paid: false,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmount,
      orderId: order._id,
      message: "Stripe payment initiated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Order creation failed",
      error: error.message,
    });
  }
};

// CONFIRM ORDER — Called after successful payment
const confirmOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId)
      return res.status(400).json({ message: "Missing paymentIntentId" });

    // Verify payment with Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded")
      return res.status(400).json({ message: "Payment not completed" });

    // Find temporary order
    const order = await Order.findOne({
      "paymentInfo.stripePaymentIntentId": paymentIntentId,
      userId: req.user.id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Avoid duplicate processing
    if (order.paymentInfo.paid === true) {
      return res.status(200).json({
        success: true,
        message: "Order already confirmed",
        order,
      });
    }

    // ===============================
    //  REDUCE STOCK NOW (safe)
    // ===============================
    for (const it of order.items) {
      await Product.updateOne(
        { _id: it.productId, "sizes.size": it.size },
        { $inc: { "sizes.$.stock": -it.qty } }
      );
    }

    // ===============================
    //  MARK PAYMENT SUCCESSFUL
    // ===============================
    order.status = "processing";
    order.paymentInfo.paid = true;
    order.paymentInfo.txnId = pi.id;
    order.paymentInfo.stripePaymentIntentId = pi.id;

    // UPI txn id (Stripe → charge ID)
    order.paymentInfo.upiTxnId = pi.charges?.data?.[0]?.id || null;

    // ===============================
    //  GENERATE INVOICE
    // ===============================
    const htmlInvoice = generateInvoiceHtml(order);
    order.invoiceHtml = htmlInvoice;

    await order.save();

    // ===============================
    //  SEND EMAIL CONFIRMATION
    // ===============================
    const user = await User.findById(order.userId);

    if (user?.email) {
      await sendEmail(
        user.email,
        `Order Confirmation - ${order._id}`,
        templates.invoiceEmail(htmlInvoice, user.name)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order payment confirmed & saved",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Order confirmation failed",
      error: error.message,
    });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// GET ORDER BY ID (User or Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};

// UPDATE SHIPPING ADDRESS
const updateShippingAddress = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress)
      return res.status(400).json({ message: "Shipping address required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user.id.toString()
    )
      return res.status(403).json({ message: "Forbidden" });

    if (
      !["pending", "processing"].includes(order.status) &&
      req.user.role !== "admin"
    )
      return res
        .status(400)
        .json({ message: "Cannot update address after shipment" });

    const user = await User.findById(req.user.id);
    if (user) {
      if (!shippingAddress.name) shippingAddress.name = user.name;
      if (!shippingAddress.phone)
        shippingAddress.phone = user.mobile?.toString();
    }

    order.shippingAddress = shippingAddress;
    await order.save();

    return res.status(200).json({ message: "Shipping address updated", order });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update shipping address",
      error: error.message,
    });
  }
};

//  CANCEL ORDER
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user.id.toString()
    )
      return res.status(403).json({ message: "Forbidden" });

    if (["shipped", "delivered", "cancelled"].includes(order.status))
      return res
        .status(400)
        .json({ message: `Cannot cancel ${order.status} order` });

    // Restore stock
    for (const it of order.items) {
      await Product.updateOne(
        { _id: it.productId, "sizes.size": it.size },
        { $inc: { "sizes.$.stock": it.qty } }
      );
    }

    order.status = "cancelled";
    order.cancelledAt = new Date(); // 👈 important

    await order.save();

    const user = await User.findById(order.userId);
    if (user?.email) {
      await sendEmail(
        user.email,
        `Order Cancelled - ${order._id}`,
        templates.orderCancelled(user.name || "User", order._id)
      );
    }

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// ADMIN — UPDATE STATUS
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// ADMIN — LIST ORDERS (PAGINATED)
const adminOrderList = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments();

    return res.status(200).json({
      total,
      page: Number(page),
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};

// ADMIN — DELETE ORDER
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  confirmOrder,
  getMyOrders,
  getOrderById,
  updateShippingAddress,
  cancelOrder,
  updateStatus,
  adminOrderList,
  deleteOrder,
};
