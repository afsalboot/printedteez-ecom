const Cart = require("../models/Cart");
const Product = require("../models/Product");

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

// GET CART
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
      "title images"
    );

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to load cart", error: error.message });
  }
};


// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { productId, size, qty, color, image } = req.body;
    console.log("cart body", req.body);

    if (!productId || !size || !qty)
      return res.status(400).json({ message: "Missing fields" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.colors?.length > 0 && !color) {
      return res.status(400).json({ message: "Please select a color" });
    }

    const { color: colorVariant, size: sizeObj } = getVariantSize(product, color, size);
    if (!sizeObj)
      return res
        .status(400)
        .json({ message: "Selected size not available" });

    if (color && !colorVariant && product.colors?.length > 0) {
      return res.status(400).json({ message: "Selected color not available" });
    }

    if (Number(sizeObj.stock || 0) < Number(qty)) {
      return res.status(400).json({ message: "Selected quantity exceeds stock" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    const idx = cart.items.findIndex(
      (i) =>
        i.productId.toString() === productId &&
        i.size === size &&
        i.color === color
    );

    // choose image: prefer client image, fallback to product.images[0]
    const finalImage =
      image ||
      (product.images && product.images.length > 0 ? product.images[0] : null);

    if (idx > -1) {
      const nextQty = Number(cart.items[idx].qty || 0) + Number(qty || 0);
      if (Number(sizeObj.stock || 0) < nextQty) {
        return res.status(400).json({ message: "Selected quantity exceeds stock" });
      }
      cart.items[idx].qty = nextQty;
    } else {
      cart.items.push({
        productId,
        size,
        color,
        qty,
        price: sizeObj.price,
        image: finalImage,      // 👈 store image
        title: product.title,   // 👈 store title
      });
    }

    await cart.save();
    // keep response consistent with getCart
    cart = await cart.populate("items.productId", "title images");

    console.log("cart add success:", cart);
    res.json({ message: "Added to cart", cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: error.message });
  }
};


// UPDATE QTY (by itemId)
const updateQty = async (req, res) => {
  try {
    const { itemId, qty } = req.body;

    if (!itemId || qty == null) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const idx = cart.items.findIndex(
      (i) => i._id.toString() === itemId
    );

    if (idx === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (qty <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const item = cart.items[idx];
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const { size: sizeObj } = getVariantSize(product, item.color, item.size);
      if (!sizeObj) {
        return res.status(400).json({ message: "Selected size not available" });
      }

      if (Number(sizeObj.stock || 0) < Number(qty)) {
        return res.status(400).json({ message: "Selected quantity exceeds stock" });
      }

      cart.items[idx].qty = qty;
    }

    await cart.save();

    const populatedCart = await cart.populate(
      "items.productId",
      "title images"
    );

    res.json({ message: "Quantity updated", cart: populatedCart });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update quantity",
      error: error.message,
    });
  }
};


// REMOVE ITEM
const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i._id.toString() !== itemId
    );

    await cart.save();

    // If you want populated product images/titles in response:
    const populatedCart = await cart.populate(
      "items.productId",
      "title images"
    );

    res.json({ message: "Item removed", cart: populatedCart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove item", error: error.message });
  }
};

// CLEAR CART
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQty,
  removeItem,
  clearCart,
};
