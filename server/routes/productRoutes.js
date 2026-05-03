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
  adminListCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  recommendedProducts,
  suggestSKU,
  searchProducts,
} = require("../controllers/productController.js");

const router = express.Router();

// Public Routes
router.get("/all-products", listAllProducts);
router.get("/get-product/:id", getProductById);
router.get("/categories", getCategories);
router.get("/admin/categories", protected, isAdmin, adminListCategories);
router.get("/search", searchProducts);


// Needs login (personalised)
router.get("/recommended", protected, recommendedProducts);

// Admin Routes
router.post("/admin/create-product", protected, isAdmin, upload.any(), createProduct);

router.put(
  "/admin/update-product/:id",
  protected,
  isAdmin,
  upload.any(),
  updateProduct
);

router.delete("/admin/delete-product/:id", protected, isAdmin, deleteProduct);

router.patch("/admin/toggle-featured/:id", protected, isAdmin, toggleFeatured);
router.post("/admin/categories", protected, isAdmin, upload.any(), createCategory);
router.put("/admin/categories/:id", protected, isAdmin, upload.any(), updateCategory);
router.delete("/admin/categories/:id", protected, isAdmin, deleteCategory);

router.get("/admin/sku-suggest", protected, isAdmin, suggestSKU);

module.exports = router;
