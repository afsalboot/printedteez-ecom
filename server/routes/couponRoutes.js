const express = require("express");
const protected = require("../middlewares/authMiddleware.js");
const isAdmin = require("../middlewares/isAdmin.js");
const { createCoupon, validateCoupons, listCoupons, updateCoupon, deleteCoupon, toggleCouponStatus, getActiveOffers } = require("../controllers/couponController.js");
const router = express.Router();

//Public
router.get("/validate-coupon", validateCoupons);

// Admin
router.post("/create-coupon", protected, isAdmin, createCoupon);
router.get("/list-coupon", protected, isAdmin, listCoupons);
router.put("/update-coupon/:id", protected, isAdmin, updateCoupon);
router.delete("/delete-coupon/:id", protected, isAdmin, deleteCoupon);
router.patch("/toggle-coupon/:id", protected, isAdmin, toggleCouponStatus);
router.get("/active-offers", getActiveOffers);



module.exports = router;
