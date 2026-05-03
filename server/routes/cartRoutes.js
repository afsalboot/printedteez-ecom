const express = require("express");
const router = express.Router();
const protected = require("../middlewares/authMiddleware.js");
const {
  getCart,
  addToCart,
  updateQty,
  removeItem,
  clearCart,
} = require("../controllers/cartController.js");

router.get("/get-cart", protected, getCart);

router.post("/add-to-cart", protected, addToCart);

router.put("/update-qty", protected, updateQty);

router.delete("/remove-cart/:itemId", protected, removeItem);

router.delete("/clear-cart", protected, clearCart);

module.exports = router;
