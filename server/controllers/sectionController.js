const Section = require("../models/Section");

const createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1, createdAt: -1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: "Not found" });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSection = async (req, res) => {
  try {
    const updated = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    const deleted = await Section.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
};
