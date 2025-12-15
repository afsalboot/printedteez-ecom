const { cloudinary } = require("../config/cloudinary.js");
const sendEmail = require("../config/mailer.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const templates = require("../utils/emailTemplates.js");

// GET ALL PRODUCTS
const listAllProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      collection,
      size,
      featured,
      flashSale,
      limitedEdition,
      discount,
      minPrice,
      maxPrice,
      sort = "latest",
      page = 1,
      limit = 12,
      sexCategory,
      material,
      fitType,
      neckType,
      sleeveType,
    } = req.query;

    const filter = {};

    if (q) filter.title = { $regex: q, $options: "i" };

    if (category) filter.category = category;
    if (collection) filter.collections = collection;
    if (size) filter["sizes.size"] = size;

    if ("featured" in req.query) filter.featured = featured === "true";
    if ("flashSale" in req.query) filter.flashSale = flashSale === "true";
    if ("limitedEdition" in req.query)
      filter.limitedEdition = limitedEdition === "true";

    if (discount) filter.discount = { $gte: Number(discount) };

    if (sexCategory) filter.sexCategory = sexCategory;
    if (material) filter.material = material;
    if (fitType) filter.fitType = fitType;
    if (neckType) filter.neckType = neckType;
    if (sleeveType) filter.sleeveType = sleeveType;

    if (minPrice || maxPrice) {
      filter["sizes.price"] = {};
      if (minPrice) filter["sizes.price"].$gte = Number(minPrice);
      if (maxPrice) filter["sizes.price"].$lte = Number(maxPrice);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // SORTING LOGIC
    let sortOption = {};

    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "new": {
        const days = 7;
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        filter.createdAt = { $gte: dateLimit };
        sortOption = { createdAt: -1 };
        break;
      }

      case "price_asc":
        sortOption = { "sizes.price": 1 };
        break;

      case "price_desc":
        sortOption = { "sizes.price": -1 };
        break;

      case "salesCount":
        filter.salesCount = { $gte: 10 };
        sortOption = { salesCount: -1 };
        break;

      case "views":
        filter.views = { $gte: 100 };
        sortOption = { views: -1 };
        break;

      case "discount":
        sortOption = { discount: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      products,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching products",
      error: err.message,
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { recentlyViewed: req.params.id },
      });
    }

    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching product",
      error: err.message,
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      title,
      sku,
      description,
      category,
      sexCategory,
      material,
      fabricWeight,
      pattern,
      fitType,
      neckType,
      sleeveType,
      sizes = "[]",
      tags = "[]",
      colors = "[]",
      collections = "[]",
      featured,
      flashSale,
      limitedEdition,
      discount,
      flashSaleEnds,
    } = req.body;

    const sizesArr = JSON.parse(sizes);
    const tagsArr = JSON.parse(tags);
    const colorsArr = JSON.parse(colors); // [{name,hex}]
    const collectionsArr = JSON.parse(collections);

    const files = req.files; // contains multiple fields + color images

    // GLOBAL PRODUCT IMAGE UPLOAD
    let productImages = [];

    if (files["images"]) {
      const uploads = files["images"].map(async (file) => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;
        const upload = await cloudinary.uploader.upload(base64, {
          folder: "printedteez/products/global",
        });
        return upload.secure_url;
      });
      productImages = await Promise.all(uploads);
    }

    // COLOR IMAGE UPLOAD
    for (let i = 0; i < colorsArr.length; i++) {
      const colorField = `colorImages_${i}`;
      const colorFiles = req.files.filter((f) => f.fieldname === colorField);

      colorsArr[i].images = [];

      if (colorFiles.length > 0) {
        const uploads = colorFiles.map(async (file) => {
          const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
            "base64"
          )}`;
          const up = await cloudinary.uploader.upload(base64, {
            folder: `printedteez/products/colors/${sku}/${colorsArr[i].name}`,
          });
          return up.secure_url;
        });

        colorsArr[i].images = await Promise.all(uploads);
      }
    }

    const product = await Product.create({
      title,
      sku,
      description,
      category,
      sexCategory,
      material,
      fabricWeight,
      pattern,
      fitType,
      neckType,
      sleeveType,
      sizes: sizesArr,
      tags: tagsArr,
      images: productImages,
      collections: collectionsArr,
      colors: colorsArr,
      featured: featured === "true",
      flashSale: flashSale === "true",
      limitedEdition: limitedEdition === "true",
      discount: Number(discount),
      flashSaleEnds: flashSaleEnds ? new Date(flashSaleEnds) : null,
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("err at create product backend:", err.message);
    return res.status(500).json({
      message: "Create Product Failed",
      error: err.message,
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updates = { ...req.body };

    // ---------------------------------
    // PARSE ARRAYS
    // ---------------------------------
    updates.sizes = JSON.parse(updates.sizes || "[]");
    updates.tags = JSON.parse(updates.tags || "[]");
    const incomingColors = JSON.parse(updates.colors || "[]");
    updates.collections = JSON.parse(updates.collections || "[]");

    // ---------------------------------
    // PREPARE EXISTING COLORS
    // ---------------------------------
    let finalColors = product.colors.map((c) => ({
      ...c.toObject(),
      images: [...c.images],
    }));

    // Update name + hex but keep existing images
    finalColors = incomingColors.map((c, i) => ({
      ...finalColors[i],
      name: c.name,
      hex: c.hex,
      images: finalColors[i]?.images || [],
    }));

    // ---------------------------------
    // REMOVE GLOBAL IMAGES
    // ---------------------------------
    const toRemoveImages = JSON.parse(updates.removedImages || "[]");

    if (toRemoveImages.length) {
      for (const url of toRemoveImages) {
        try {
          const publicId = url.split("/").slice(-2).join("/").split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {}
      }

      product.images = product.images.filter(
        (img) => !toRemoveImages.includes(img)
      );
    }

    // ---------------------------------
    // REMOVE COLOR IMAGES
    // ---------------------------------
    const removedColorImages = JSON.parse(updates.removedColorImages || "[]");

    removedColorImages.forEach((obj) => {
      const { colorIndex, removedUrls } = obj;

      removedUrls.forEach(async (url) => {
        try {
          const publicId = url.split("/").slice(-2).join("/").split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {}
      });

      finalColors[colorIndex].images = finalColors[colorIndex].images.filter(
        (url) => !removedUrls.includes(url)
      );
    });

    // ---------------------------------
    // UPLOAD NEW GLOBAL IMAGES (fix req.files)
    // ---------------------------------
    const globalFiles = req.files.filter((f) => f.fieldname === "images");

    let newGlobalImages = [];

    if (globalFiles.length > 0) {
      const uploads = globalFiles.map(async (file) => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;
        const up = await cloudinary.uploader.upload(base64, {
          folder: `printedteez/products/global`,
        });
        return up.secure_url;
      });

      newGlobalImages = await Promise.all(uploads);
    }

    const mergedGlobalImages = [...product.images, ...newGlobalImages];

    // ---------------------------------
    // UPLOAD NEW COLOR IMAGES (WORKING FIX)
    // ---------------------------------
    for (let i = 0; i < finalColors.length; i++) {
      const fieldName = `colorImages_${i}`;
      const colorFiles = req.files.filter((f) => f.fieldname === fieldName);

      if (colorFiles.length > 0) {
        const uploads = colorFiles.map(async (file) => {
          const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
            "base64"
          )}`;
          const up = await cloudinary.uploader.upload(base64, {
            folder: `printedteez/products/colors/${updates.sku}/${finalColors[i].name}`,
          });
          return up.secure_url;
        });

        const newColorImgs = await Promise.all(uploads);
        finalColors[i].images = [...finalColors[i].images, ...newColorImgs];
      }
    }

    // ---------------------------------
    // SET FINAL UPDATE DATA
    // ---------------------------------
    updates.images = mergedGlobalImages;
    updates.colors = finalColors;
    updates.collections = updates.collections;

    // Booleans
    updates.featured = updates.featured === "true" || updates.featured === true;
    updates.flashSale =
      updates.flashSale === "true" || updates.flashSale === true;
    updates.limitedEdition =
      updates.limitedEdition === "true" || updates.limitedEdition === true;

    // Numbers
    updates.discount = Number(updates.discount || 0);

    // ---------------------------------
    // SAVE PRODUCT
    // ---------------------------------
    const updated = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting product",
      error: err.message,
    });
  }
};

// TOGGLE FEATURED
const toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.featured = !product.featured;
    await product.save();

    return res.status(200).json({
      message: `Product ${product.featured ? "featured" : "unfeatured"}`,
      product,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET STATIC CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = [
      "Basic Tee",
      "T-shirt",
      "Oversized Tee",
      "Polo T-shirt",
      "Tank Top",
      "Crop Top",
      "Long Sleeve Tee",
      "Raglan Sleeve Tee",
      "Henley Tee",
    ];

    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching categories",
      error: err.message,
    });
  }
};

// RECOMMENDED PRODUCTS
const recommendedProducts = async (req, res) => {
  try {
    let user = null;

    // req.user exists only if token is passed
    if (req.user?.id) {
      user = await User.findById(req.user.id)
        .populate("wishlist")
        .populate("recentlyViewed");
    }

    let category = null;

    if (user?.wishlist?.length > 0) {
      category = user.wishlist[0].category;
    } else if (user?.recentlyViewed?.length > 0) {
      category = user.recentlyViewed[0].category;
    }

    let products;

    if (category) {
      products = await Product.find({ category }).limit(10);
    } else {
      products = await Product.find({ featured: true }).limit(10);
    }

    return res.status(200).json({ products });
  } catch (err) {
    console.error("Recommended error:", err.message);
    return res.status(500).json({ message: "Error fetching recommendations" });
  }
};

const suggestSKU = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title || title.trim().length < 1) {
      return res.status(400).json({ message: "Title too short" });
    }

    // First word only
    const firstWord = title.trim().split(" ")[0];

    // Full first word, uppercase, remove symbols
    const base = firstWord.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Find existing SKUs with same prefix
    const existing = await Product.find({
      sku: { $regex: `^${base}-` },
    }).select("sku");

    // Extract numbers from old SKUs
    const numbers = existing.map((p) => {
      const num = p.sku.replace(base + "-", "");
      return parseInt(num) || 0;
    });

    const nextNum = (Math.max(...numbers, 0) + 1).toString().padStart(3, "0");

    const sku = `${base}-${nextNum}`;

    res.json({ suggestedSKU: sku });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query.trim()) return res.json([]);

    const regex = new RegExp(query, "i");

    const products = await Product.find({
      $or: [
        { title: { $regex: regex } },
        { sku: { $regex: regex } },
        { tags: { $regex: regex } },
        { category: { $regex: regex } },
        { collections: { $regex: regex } },
      ],
    })
      .limit(10)
      .select("title sku images colors.images sizes discount");

    // Shape response into lightweight suggestion objects
    const suggestions = products.map((p) => {
      const prices = (p.sizes || []).map((s) => s.price);
      const minPrice = prices.length ? Math.min(...prices) : 0;

      const thumbnail = p.images?.[0] || p.colors?.[0]?.images?.[0] || null;

      return {
        _id: p._id,
        title: p.title,
        sku: p.sku,
        price: minPrice,
        discount: p.discount || 0,
        thumbnail,
      };
    });

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  getCategories,
  recommendedProducts,
  suggestSKU,
  searchProducts,
};
