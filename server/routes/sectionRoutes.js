const express = require("express");

const {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

const router = express.Router();

router.get("/get-sections", getSections);
router.get("/single-Section/:id", getSectionById);
router.post("/admin/create-section", protect, isAdmin, createSection);
router.put("/admin/update-section/:id", protect, isAdmin, updateSection);
router.delete("/admin/delete-section/:id", protect, isAdmin, deleteSection);

module.exports = router;
