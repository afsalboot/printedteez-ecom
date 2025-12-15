const User = require("../models/User");
const Product = require("../models/Product");

// Add product to wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    const index = user.wishlist.indexOf(productId);

    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    res.json({
      message: index === -1 ? "Added to wishlist" : "Removed from wishlist",
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: "Wishlist update failed", error: error.message });
  }
};

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};


module.exports = {toggleWishlist, getWishlist}