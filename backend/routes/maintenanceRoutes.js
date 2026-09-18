const express = require("express");
const systemConfigModel = require("../models/systemConfigModel");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

const router = express.Router();

// Helper to get or create default config
const getSystemConfig = async () => {
  let config = await systemConfigModel.findOne();
  if (!config) {
    config = await new systemConfigModel({
      isMaintenance: false,
      maintenanceTitle: "Scheduled Maintenance in Progress 🚀",
      maintenanceMessage:
        "We are currently upgrading Zelan Store systems to serve you better. We'll be back shortly!",
      estimatedEndTime: "",
      supportTelegram: "https://t.me/zelanstore",
      supportWhatsapp: "",
    }).save();
  }
  return config;
};

// GET /api/maintenance/status (Public)
router.get("/status", async (req, res) => {
  try {
    const config = await getSystemConfig();
    return res.status(200).json({
      success: true,
      data: {
        isMaintenance: Boolean(config.isMaintenance),
        maintenanceTitle: config.maintenanceTitle,
        maintenanceMessage: config.maintenanceMessage,
        estimatedEndTime: config.estimatedEndTime,
        supportTelegram: config.supportTelegram,
        supportWhatsapp: config.supportWhatsapp,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching maintenance status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error checking maintenance status",
    });
  }
});

// POST /api/maintenance/update (Admin Protected)
router.post("/update", adminAuthMiddleware, async (req, res) => {
  try {
    const {
      isMaintenance,
      maintenanceTitle,
      maintenanceMessage,
      estimatedEndTime,
      supportTelegram,
      supportWhatsapp,
    } = req.body;

    const config = await getSystemConfig();

    if (typeof isMaintenance === "boolean") {
      config.isMaintenance = isMaintenance;
    }
    if (maintenanceTitle !== undefined) {
      config.maintenanceTitle = maintenanceTitle;
    }
    if (maintenanceMessage !== undefined) {
      config.maintenanceMessage = maintenanceMessage;
    }
    if (estimatedEndTime !== undefined) {
      config.estimatedEndTime = estimatedEndTime;
    }
    if (supportTelegram !== undefined) {
      config.supportTelegram = supportTelegram;
    }
    if (supportWhatsapp !== undefined) {
      config.supportWhatsapp = supportWhatsapp;
    }
    config.updatedBy = req.body.email || "Admin";

    await config.save();

    console.log(
      `[MAINTENANCE_UPDATE] Status changed to: ${config.isMaintenance ? "ACTIVE (ON)" : "INACTIVE (OFF)"}`
    );

    return res.status(200).json({
      success: true,
      message: `Maintenance mode ${config.isMaintenance ? "activated" : "deactivated"} successfully`,
      data: config,
    });
  } catch (error) {
    console.error("Error updating maintenance config:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating maintenance config: " + error.message,
    });
  }
});

module.exports = router;
