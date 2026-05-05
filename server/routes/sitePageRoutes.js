const express = require("express");
const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const {
  getSitePage,
  getAdminSitePages,
  updateSitePage,
} = require("../controllers/sitePageController");

const router = express.Router();

router.get("/admin/all", protect, isAdmin, getAdminSitePages);
router.put("/admin/:page", protect, isAdmin, updateSitePage);
router.get("/:page", getSitePage);

module.exports = router;
