const express = require("express");
const protected = require("../middlewares/authMiddleware.js");
const { optionalProtected } = require("../middlewares/authMiddleware.js");
const isAdmin = require("../middlewares/isAdmin.js");
const { createCoupon, validateCoupons, listCoupons, updateCoupon, deleteCoupon, toggleCouponStatus, getActiveOffers } = require("../controllers/couponController.js");
const router = express.Router();

//Public
router.get("/validate-coupon", optionalProtected, validateCoupons);

// Admin
router.post("/admin/create-coupon", protected, isAdmin, createCoupon);
router.get("/admin/list-coupon", protected, isAdmin, listCoupons);
router.put("/admin/update-coupon/:id", protected, isAdmin, updateCoupon);
router.delete("/admin/delete-coupon/:id", protected, isAdmin, deleteCoupon);
router.patch("/admin/toggle-coupon/:id", protected, isAdmin, toggleCouponStatus);
router.get("/active-offers", optionalProtected, getActiveOffers);



module.exports = router;
