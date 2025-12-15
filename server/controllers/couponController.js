const sendEmail = require("../config/mailer.js");
const Coupon = require("../models/Coupon.js");
const User = require("../models/User.js");
const templates = require("../utils/emailTemplates.js");

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, amount, description, isActive, expiryDate } =
      req.body;

    // Required validations
    if (!code || !discountType || !amount) {
      return res.status(400).json({
        message: "code, discountType and amount are required",
      });
    }

    const exists = await Coupon.findOne({ code });
    if (exists)
      return res.status(400).json({ message: "Coupon code already exists" });

    // Create coupon
    const coupon = await Coupon.create({
      ...req.body,
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    // Fetch verified users
    const users = await User.find({ verified: true }).select("name email");

    // If no users, return success immediately
    if (!users.length) {
      return res.status(201).json({
        message: "Coupon created successfully (no users found).",
        coupon,
      });
    }

    // Send promotional emails safely (non-blocking)
    try {
      const emailSubject = `🎉 New Discount! Use Code ${code} for ${
        coupon.amount
      }${coupon.discountType === "percentage" ? "% Off" : "₹ Off"} 🛍️`;

      for (const user of users) {
        const html = templates.promotionEmail(
          user.name,
          code,
          amount,
          expiryDate,
          description
        );

        await sendEmail(user.email, emailSubject, html);
      }
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message);
      // Do NOT break API response
    }

    return res.status(201).json({
      message: `Coupon created successfully.`,
      coupon,
    });

  } catch (error) {
    console.error("Coupon creation error:", error);
    return res.status(500).json({
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};


const getActiveOffers = async (req, res) => {
  try {
    const today = new Date();

    const offers = await Coupon.find({
      isActive: true,
      $or: [
        { expiryDate: { $gte: today } }, // Not expired
        { expiryDate: null }, // No expiry
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch active offers",
      error: error.message,
    });
  }
};

const validateCoupons = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.query;
    if (!code) return res.status(400).json({ message: "Code required" });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(400).json({ message: "Invalid coupon" });

    if (coupon.isActive === false)
      return res.status(400).json({ message: "This coupon is disabled" });

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate))
      return res.status(400).json({ message: "Coupon expired" });

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue)
      return res
        .status(400)
        .json({ message: `Minimum order ₹${coupon.minOrderValue} is not met` });

    // compute discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage")
      discountAmount = (subtotal * coupon.amount) / 100;
    else discountAmount = coupon.amount;

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountAmount,
      description: coupon.description,
      expiryDate: coupon.expiryDate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Coupon validation failed",
      error: error.message,
    });
  }
};

const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(coupons);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to list coupons", error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    if (req.body.code && req.body.code !== coupon.code) {
      const exists = await Coupon.findOne({ code: req.body.code });
      if (exists)
        return res.status(400).json({ message: "Coupon code already exists" });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update coupon",
      error: error.message,
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    await Coupon.findByIdAndDelete(id);
    return res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete coupon", error: error.message });
  }
};

//toggle status
const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res
      .status(200)
      .json({ message: `Coupon ${coupon.isActive ? "enabled" : "disabled"}` });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

module.exports = {
  createCoupon,
  validateCoupons,
  listCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getActiveOffers,
};
