const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const CategoryModel = require("../models/CategoryModel");

// Get all categories
router.get("/", async (req, res) => {
  const categories = await CategoryModel.find();
  res.json(categories);
});

// Add category
router.post("/", adminAuthMiddleware, async (req, res) => {
  const newCategory = new CategoryModel({ name: req.body.name, serialNumber: req.body.serialNumber });
  await newCategory.save();
  res.json({ message: "Category added!" });
});

// Update category
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  await CategoryModel.findByIdAndUpdate(req.params.id, { name: req.body.name, serialNumber: req.body.serialNumber });
  res.json({ message: "Category updated!" });
});

// Delete category
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  await CategoryModel.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted!" });
});

module.exports = router;
