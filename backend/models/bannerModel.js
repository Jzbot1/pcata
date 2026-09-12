const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    link: {
      type: String,
    },
    seq: {
      type: Number, // Add this field
    },
    heading: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  { timestamps: true }
);

const bannerModel = mongoose.model("banner", bannerSchema);
module.exports = bannerModel;
