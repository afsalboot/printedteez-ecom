const Feedback = require("../models/Feedback.js");

const createFeedback = async (req, res) => {
  try {
    const { productId, rating, comment = "" } = req.body;
    if (!productId || rating === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Ensure single feedback per user per product
    const existing = await Feedback.findOne({
      productId,
      userId: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already submitted feedback for this product",
        feedback: existing,
      });
    }

    const f = await Feedback.create({
      productId,
      userId: req.user.id,
      rating,
      comment,
    });

    return res.status(200).status(201).json({ message: "Feedback submitted", feedback: f });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to submit feedback", error: error.message });
  }
};

const feedbackListByProduct = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      productId: req.params.productId,
    }).populate("userId", "name profileImageUrl");
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to list feedback", error: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    if (!feedback.userId.equals(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;

    await feedback.save();

    return res.status(200).json({ message: "Feedback updated", feedback });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    // Check ownership
    if (!feedback.userId.equals(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await feedback.deleteOne();

    return res.status(200).json({ message: "Feedback deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  updateFeedback,
  deleteFeedback,
  feedbackListByProduct,
};
