const express = require("express");
const protected = require("../middlewares/authMiddleware.js");
const isAdmin = require("../middlewares/isAdmin.js");
const { createFeedback, feedbackListByProduct, updateFeedback, deleteFeedback } = require("../controllers/feedbackController.js");
const router = express.Router();

//Public
router.post("/create-feedback", protected, createFeedback);
router.get("/list-feedback/:productId", feedbackListByProduct);
router.put("/update-feedback/:id", protected, updateFeedback);
router.delete("/delete-feedback/:id", protected, deleteFeedback);

module.exports = router;
