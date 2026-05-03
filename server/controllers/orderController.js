const sendEmail = require("../config/mailer.js");
const Coupon = require("../models/Coupon.js");
const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const templates = require("../utils/emailTemplates.js");
const generateInvoiceHtml = require("../utils/invoiceGenerator.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const populateOrderUser = { path: "userId", select: "name email mobile" };
const WELCOME_WINDOW_DAYS = 7;
const normalizeCouponCode = (code = "") => String(code).trim().toUpperCase();
const isWelcomeCoupon = (code = "") =>
  normalizeCouponCode(code).startsWith("WELCOME");
const hasUserUsedCoupon = (user, code = "") =>
  (user?.usedCoupons || []).some(
    (entry) => normalizeCouponCode(entry.code) === normalizeCouponCode(code)
  );
const isWelcomeCouponEligibleForUser = (user) => {
  if (!user?.createdAt) return false;
  const createdAt = new Date(user.createdAt).getTime();
  const cutoff = Date.now() - WELCOME_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return createdAt >= cutoff;
};
const markCouponAsUsed = async (userId, code, orderId = null) => {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) return;

  await User.updateOne(
    { _id: userId, "usedCoupons.code": { $ne: normalizedCode } },
    {
      $push: {
        usedCoupons: {
          code: normalizedCode,
          usedAt: new Date(),
          orderId,
        },
      },
    }
  );
};

const findColorVariant = (product, colorName) => {
  if (!colorName) return null;
  return (product.colors || []).find(
    (color) => color.name?.toLowerCase() === String(colorName).toLowerCase()
  );
};

const getVariantSize = (product, colorName, sizeName) => {
  const color = findColorVariant(product, colorName);
  const variantSize = color?.sizes?.find((size) => size.size === sizeName);

  if (variantSize) {
    return { color, size: variantSize };
  }

  const fallbackSize = (product.sizes || []).find((size) => size.size === sizeName);
  return { color, size: fallbackSize || null };
};

const updateVariantStock = async (productId, colorName, sizeName, qtyDelta) => {
  if (colorName) {
    const product = await Product.findById(productId);
    if (!product) return;

    const color = findColorVariant(product, colorName);
    const size = color?.sizes?.find((entry) => entry.size === sizeName);

    if (color && size) {
      size.stock = Number(size.stock || 0) + Number(qtyDelta || 0);
      product.sizes = (product.sizes || []).map((entry) => {
        if (entry.size !== sizeName) return entry;
        return {
          ...entry.toObject(),
          stock: Number(entry.stock || 0) + Number(qtyDelta || 0),
        };
      });
      await product.save();
      return;
    }
  }

  await Product.updateOne(
    { _id: productId, "sizes.size": sizeName },
    { $inc: { "sizes.$.stock": qtyDelta } }
  );
};

const mapOrderForAdmin = (orderDoc) => {
  const order = orderDoc?.toObject ? orderDoc.toObject() : orderDoc;
  if (!order) return null;

  return {
    ...order,
    user: order.userId || null,
  };
};

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress = {}, couponCode, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!["cod", "stripe", "upi"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!shippingAddress.name) shippingAddress.name = user.name;
    if (!shippingAddress.phone) shippingAddress.phone = user.mobile?.toString() || "";

    let subTotal = 0;
    const filledItems = [];

    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (product.colors?.length > 0 && !it.color) {
        return res.status(400).json({
          message: `Please select a color for ${product.title}`,
        });
      }

      const { color: colorVariant, size: sizeObj } = getVariantSize(
        product,
        it.color,
        it.size
      );
      if (!sizeObj) {
        return res.status(400).json({ message: `Size ${it.size} not available` });
      }

      if (it.color && !colorVariant && product.colors?.length > 0) {
        return res
          .status(400)
          .json({ message: `Color ${it.color} not available for ${product.title}` });
      }

      if (sizeObj.stock < it.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title} (${it.color || "default"} / ${it.size})`,
        });
      }

      const price = Number(sizeObj.price);
      const total = price * Number(it.qty);
      subTotal += total;

      const image =
        it.image && typeof it.image === "string" && it.image.trim() !== ""
          ? it.image
          : Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "";

      filledItems.push({
        productId: product._id,
        title: product.title,
        size: it.size,
        color: it.color || "",
        price,
        qty: Number(it.qty),
        image,
      });
    }

    let discountAmount = 0;
    let couponApplied = { code: null, discountAmount: 0 };

    if (couponCode) {
      const normalizedCode = normalizeCouponCode(couponCode);
      const coupon = await Coupon.findOne({ code: normalizedCode });
      if (!coupon) return res.status(400).json({ message: "Invalid coupon" });
      if (!coupon.isActive) return res.status(400).json({ message: "Coupon disabled" });
      if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ message: "Coupon expired" });
      }
      if (coupon.minOrderValue && subTotal < coupon.minOrderValue) {
        return res.status(400).json({ message: "Minimum order not met" });
      }
      if (hasUserUsedCoupon(user, coupon.code)) {
        return res.status(400).json({ message: "You have already used this coupon" });
      }
      if (isWelcomeCoupon(coupon.code) && !isWelcomeCouponEligibleForUser(user)) {
        return res.status(400).json({
          message: "Welcome offer is valid only within 7 days of signup",
        });
      }

      discountAmount =
        coupon.discountType === "percentage"
          ? (subTotal * coupon.amount) / 100
          : coupon.amount;

      couponApplied = { code: coupon.code, discountAmount };
    }

    const finalAmount = Math.max(0, subTotal - discountAmount);

    if (paymentMethod === "cod") {
      for (const it of filledItems) {
        await updateVariantStock(it.productId, it.color, it.size, -it.qty);
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
      if (couponApplied.code) {
        await markCouponAsUsed(req.user.id, couponApplied.code, order._id);
      }

      return res.status(201).json({
        success: true,
        message: "Order placed successfully (COD)",
        order,
      });
    }

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

const confirmOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Missing paymentIntentId" });
    }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findOne({
      "paymentInfo.stripePaymentIntentId": paymentIntentId,
      userId: req.user.id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentInfo.paid === true) {
      return res.status(200).json({
        success: true,
        message: "Order already confirmed",
        order,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const priorCouponUse = (user.usedCoupons || []).find(
      (entry) =>
        normalizeCouponCode(entry.code) ===
          normalizeCouponCode(order.couponApplied?.code || "") &&
        entry.orderId?.toString() !== order._id.toString()
    );

    if (priorCouponUse) {
      return res.status(400).json({
        message: "You have already used this coupon",
      });
    }

    for (const it of order.items) {
      await updateVariantStock(it.productId, it.color, it.size, -it.qty);
    }

    order.status = "processing";
    order.paymentInfo.paid = true;
    order.paymentInfo.txnId = pi.id;
    order.paymentInfo.stripePaymentIntentId = pi.id;
    order.paymentInfo.upiTxnId = pi.charges?.data?.[0]?.id || null;

    const htmlInvoice = generateInvoiceHtml(order);
    order.invoiceHtml = htmlInvoice;

    await order.save();
    if (order.couponApplied?.code) {
      await markCouponAsUsed(req.user.id, order.couponApplied.code, order._id);
    }

    const orderUser = await User.findById(order.userId);
    if (orderUser?.email) {
      await sendEmail(
        orderUser.email,
        `Order Confirmation - ${order._id}`,
        templates.invoiceEmail(htmlInvoice, orderUser.name)
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

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(populateOrderUser);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.userId?._id?.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(mapOrderForAdmin(order));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};

const updateShippingAddress = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (
      !["pending", "processing"].includes(order.status) &&
      req.user.role !== "admin"
    ) {
      return res
        .status(400)
        .json({ message: "Cannot update address after shipment" });
    }

    const user = await User.findById(req.user.id);
    if (user) {
      if (!shippingAddress.name) shippingAddress.name = user.name;
      if (!shippingAddress.phone) shippingAddress.phone = user.mobile?.toString();
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

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel ${order.status} order` });
    }

    for (const it of order.items) {
      await updateVariantStock(it.productId, it.color, it.size, it.qty);
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();

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

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate(populateOrderUser);

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order: mapOrderForAdmin(order) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

const adminOrderList = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate(populateOrderUser);

    const total = await Order.countDocuments();

    return res.status(200).json({
      total,
      page: Number(page),
      orders: orders.map(mapOrderForAdmin),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};

const adminGetOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(populateOrderUser);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = order.userId?._id || order.userId;
    const userOrders = await Order.find({
      userId,
      _id: { $ne: order._id },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id createdAt status finalAmount subTotal tracking items")
      .lean();

    return res.status(200).json({
      order: {
        ...mapOrderForAdmin(order),
        invoiceHtml: order.invoiceHtml || generateInvoiceHtml(order),
      },
      userOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

const updateTrackingDetails = async (req, res) => {
  try {
    const { carrier = "", trackingId = "", trackingUrl = "" } = req.body;

    const order = await Order.findById(req.params.id).populate(populateOrderUser);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.tracking = {
      carrier: carrier.trim(),
      trackingId: trackingId.trim(),
      trackingUrl: trackingUrl.trim(),
      updatedAt:
        carrier.trim() || trackingId.trim() || trackingUrl.trim()
          ? new Date()
          : null,
    };

    await order.save();

    return res.status(200).json({
      message: "Tracking details updated",
      order: mapOrderForAdmin(order),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update tracking details",
      error: error.message,
    });
  }
};

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
  adminGetOrderDetails,
  updateTrackingDetails,
  deleteOrder,
};
