const mongoose = require("mongoose");

const sitePageSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      enum: ["about", "blog", "contact"],
    },
    hero: {
      eyebrow: { type: String, default: "" },
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      badge: { type: String, default: "" },
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SitePage", sitePageSchema);
