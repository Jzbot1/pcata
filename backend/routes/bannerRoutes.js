const express = require("express");
const multer = require("multer");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const bannerModel = require("../models/bannerModel");

const fs = require("fs");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../banners");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const rootDir = "banners";
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }
    cb(null, "banners");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});
const upload = multer({ storage: storage });

// Routes
router.post(
  "/add-banner",
  upload.single("image"),
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { link, seq, heading, title } = req.body;
      const banner = new bannerModel({
        image: req.file ? req.file.path.replace(/\\/g, "/") : "",
        link: link ? link.trim() : "",
        seq: seq,
        heading: heading ? heading.trim() : "",
        title: title ? title.trim() : "",
      });
      await banner.save();
      return res
        .status(200)
        .send({ success: true, message: "Banner uploaded successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.get("/get-banners", async (req, res) => {
  try {
    const banners = await bannerModel.find({});
    if (!banners || banners.length === 0) {
      return res
        .status(201)
        .send({ success: false, message: "No Banner Found" });
    }
    return res.status(200).send({
      success: true,
      message: "Banner Fetched Success",
      data: banners,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/delete-banner", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const deleteBanner = await bannerModel.findOneAndDelete({ _id: id });
    if (!deleteBanner) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to delete banner" });
    }
    return res.status(200).send({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post(
  "/edit-banner",
  upload.single("image"), // Use multer to handle file uploads if needed
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { id, link, seq, heading, title } = req.body;
      const updateData = {
        link: link ? link.trim() : "",
        seq,
        heading: heading ? heading.trim() : "",
        title: title ? title.trim() : "",
      };

      // If a new image is uploaded, include it in the update
      if (req.file) {
        updateData.image = req.file.path.replace(/\\/g, "/");
      }

      const updatedBanner = await bannerModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!updatedBanner) {
        return res.status(400).send({
          success: false,
          message: "Failed to update banner",
        });
      }

      return res.status(200).send({
        success: true,
        message: "Banner updated successfully",
        data: updatedBanner,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


module.exports = router;
