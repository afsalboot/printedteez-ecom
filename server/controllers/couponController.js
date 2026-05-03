const sendEmail = require("../config/mailer.js");
const Coupon = require("../models/Coupon.js");
const User = require("../models/User.js");
const templates = require("../utils/emailTemplates.js");

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

const filterOffersForUser = (offers = [], user) =>
  offers.filter((offer) => {
    if (isWelcomeCoupon(offer.code)) {
      if (!user) return false;
      if (hasUserUsedCoupon(user, offer.code)) return false;
      return isWelcomeCouponEligibleForUser(user);
    }

    if (!user) return true;
    return !hasUserUsedCoupon(user, offer.code);
  });

const createCoupon = async (req, res) => {
  try {
    const { discountType, amount, description, isActive, expiryDate } = req.body;
    const code = normalizeCouponCode(req.body.code);

    if (!code || !discountType || !amount) {
      return res.status(400).json({
        message: "code, discountType and amount are required",
      });
    }

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      ...req.body,
      code,
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    const users = await User.find({ verified: true }).select("name email");

    if (!users.length) {
      return res.status(201).json({
        message: "Coupon created successfully (no users found).",
        coupon,
      });
    }

    try {
      const emailSubject = `New Discount! Use Code ${code} for ${
        coupon.amount
      }${coupon.discountType === "percentage" ? "% Off" : " Rs. Off"}`;

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
    }

    return res.status(201).json({
      message: "Coupon created successfully.",
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
    const user = req.user?.id
      ? await User.findById(req.user.id).select("createdAt usedCoupons")
      : null;

    const offers = await Coupon.find({
      isActive: true,
      $or: [{ expiryDate: { $gte: today } }, { expiryDate: null }],
    }).sort({ createdAt: -1 });

    const filteredOffers = filterOffersForUser(offers, user);

    return res.status(200).json({
      success: true,
      offers: filteredOffers,
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

    const normalizedCode = normalizeCouponCode(code);
    const user = req.user?.id
      ? await User.findById(req.user.id).select("createdAt usedCoupons")
      : null;

    const coupon = await Coupon.findOne({ code: normalizedCode });
    if (!coupon) return res.status(400).json({ message: "Invalid coupon" });

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is disabled" });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    if (coupon.minOrderValue && Number(subtotal) < Number(coupon.minOrderValue)) {
      return res.status(400).json({
        message: `Minimum order Rs. ${coupon.minOrderValue} is not met`,
      });
    }

    if (user && hasUserUsedCoupon(user, coupon.code)) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    if (isWelcomeCoupon(coupon.code)) {
      if (!user) {
        return res.status(400).json({ message: "Login required for welcome offer" });
      }

      if (!isWelcomeCouponEligibleForUser(user)) {
        return res.status(400).json({
          message: "Welcome offer is valid only within 7 days of signup",
        });
      }
    }

    const discountAmount =
      coupon.discountType === "percentage"
        ? (Number(subtotal) * coupon.amount) / 100
        : coupon.amount;

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      coupon,
      discountAmount,
      description: coupon.description,
      expiryDate: coupon.expiryDate,
    });
  } catch (error) {
    return res.status(500).json({
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
    return res.status(500).json({
      message: "Failed to list coupons",
      error: error.message,
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    if (req.body.code && normalizeCouponCode(req.body.code) !== coupon.code) {
      const nextCode = normalizeCouponCode(req.body.code);
      const exists = await Coupon.findOne({ code: nextCode });
      if (exists) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      req.body.code = nextCode;
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
    return res.status(500).json({
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
};

const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      message: `Coupon ${coupon.isActive ? "enabled" : "disabled"}`,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
