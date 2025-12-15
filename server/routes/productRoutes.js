const express = require("express");
const protected = require("../middlewares/authMiddleware.js");
const isAdmin = require("../middlewares/isAdmin.js");
const upload = require("../middlewares/upload.js");
const {
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
} = require("../controllers/productController.js");

const router = express.Router();

// Public Routes
router.get("/all-products", listAllProducts);
router.get("/get-product/:id", getProductById);
router.get("/categories", getCategories);
router.get("/search", searchProducts);


// Needs login (personalised)
router.get("/recommended", protected, recommendedProducts);

// Admin Routes
router.post("/create-product", protected, isAdmin, upload.any(), createProduct);

router.put(
  "/update-product/:id",
  protected,
  isAdmin,
  upload.any(),
  updateProduct
);

router.delete("/delete-product/:id", protected, isAdmin, deleteProduct);

router.patch("/toggle-featured/:id", protected, isAdmin, toggleFeatured);

router.get("/sku-suggest", protected, isAdmin, suggestSKU);

module.exports = router;
