const mongoose = require("mongoose");

const SizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, default: 0 },
  price: { type: Number, required: true },
});

const ColorSchema = new mongoose.Schema({
  name: { type: String },
  hex: { type: String },
  images: [String],
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, default: "" },

    category: {
      type: String,
      required: true,
      enum: [
        "Basic Tee",
        "T-shirt",
        "Oversized Tee",
        "Polo T-shirt",
        "Tank Top",
        "Crop Top",
        "Long Sleeve Tee",
        "Raglan Sleeve Tee",
        "Henley Tee",
      ],
    },

    sexCategory: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      required: true,
    },

    material: { type: String, required: true },
    fabricWeight: { type: String },
    pattern: { type: String },

    fitType: { type: String, required: true },
    neckType: { type: String, required: true },
    sleeveType: { type: String, required: true },

    colors: [ColorSchema],
    sizes: [SizeSchema],

    images: [String],

    tags: [String],

    collections: [
      {
        type: String,
        enum: [
          "Streetwear",
          "Anime",
          "Minimal",
          "Retro",
          "Vintage",
          "Sports",
          "Gym",
          "Summer",
          "Winter",
          "Festival",
          "Couple Wear",
          "Trending",
          "New Arrivals",
          "Best Sellers",
          "Limited Edition",
        ],
      },
    ],

    featured: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    flashSaleEnds: { type: Date, default: null },
    limitedEdition: { type: Boolean, default: false },

    salesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
