const express = require("express");
const router = express.Router();
const protected = require("../middlewares/authMiddleware.js");
const { getWishlist, toggleWishlist } = require("../controllers/wishlistController.js");


// wishlist routes
router.get("/get-wish", protected, getWishlist);
router.post("/toggle", protected, toggleWishlist);


module.exports = router;
