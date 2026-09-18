const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
  {
    isMaintenance: {
      type: Boolean,
      default: false,
    },
    maintenanceTitle: {
      type: String,
      default: "Scheduled Maintenance in Progress 🚀",
    },
    maintenanceMessage: {
      type: String,
      default:
        "We are currently upgrading Zelan Store systems to serve you better. We'll be back shortly!",
    },
    estimatedEndTime: {
      type: String,
      default: "",
    },
    supportTelegram: {
      type: String,
      default: "https://t.me/zelanstore",
    },
    supportWhatsapp: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: String,
      default: "Admin",
    },
  },
  { timestamps: true }
);

const systemConfigModel = mongoose.model("system_config", systemConfigSchema);

module.exports = systemConfigModel;
