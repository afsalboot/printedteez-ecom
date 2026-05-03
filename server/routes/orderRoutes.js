const express = require("express");
const protected = require("../middlewares/authMiddleware.js");
const isAdmin = require("../middlewares/isAdmin.js");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateStatus,
  cancelOrder,
  updateShippingAddress,
  adminOrderList,
  confirmOrder,
  deleteOrder,
  adminGetOrderDetails,
  updateTrackingDetails,
} = require("../controllers/orderController.js");

const router = express.Router();

router.post("/create-order", protected, createOrder);
router.post("/confirm-order", protected, confirmOrder);
router.get("/get-all-orders", protected, getMyOrders);
router.get("/get-order/:id", protected, getOrderById);
router.put("/update-address/:id", protected, updateShippingAddress);
router.put("/cancel-order/:id", protected, cancelOrder);

router.get("/admin/all-orders", protected, isAdmin, adminOrderList);
router.put("/admin/order/:id/status", protected, isAdmin, updateStatus);
router.get("/admin/order/:id", protected, isAdmin, adminGetOrderDetails);
router.put("/admin/order/:id/tracking", protected, isAdmin, updateTrackingDetails);
router.delete("/admin/order/:id", protected, isAdmin, deleteOrder);

module.exports = router;
