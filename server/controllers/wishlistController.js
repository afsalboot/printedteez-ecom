const User = require("../models/User");
const Product = require("../models/Product");

// Add product to wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    const index = user.wishlist.findIndex(
      (id) => id?.toString() === productId.toString()
    );
    const isAdding = index === -1;

    if (isAdding) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    await user.populate("wishlist");

    await Product.findByIdAndUpdate(productId, {
      wishlistCount: user.wishlist.some(
        (item) => item?._id?.toString() === productId.toString()
      )
        ? product.wishlistCount + 1
        : Math.max((product.wishlistCount || 1) - 1, 0),
    });

    res.json({
      message: isAdding ? "Added to wishlist" : "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: "Wishlist update failed", error: error.message });
  }
};

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};


module.exports = {toggleWishlist, getWishlist}
