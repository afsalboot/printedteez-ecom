// models/Section.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    extra: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);
