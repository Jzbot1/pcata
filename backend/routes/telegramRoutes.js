const express = require("express");
const superAdminAuthMiddleware = require("../middlewares/superAdminAuthMiddleware");
const telegramConfigModel = require("../models/telegramConfigModel");
const telegramService = require("../services/telegramService");

const router = express.Router();

/**
 * GET /api/telegram/get-config
 * Strictly protected for Super Admin
 */
router.get("/get-config", superAdminAuthMiddleware, async (req, res) => {
  try {
    let config = await telegramConfigModel.findOne().sort({ createdAt: -1 });

    if (!config) {
      config = {
        botToken: process.env.TELEGRAM_BOT_TOKEN || "",
        chatId: process.env.TELEGRAM_CHAT_ID || "",
        isEnabled: true,
      };
    }

    return res.status(200).send({
      success: true,
      message: "Telegram configuration fetched successfully",
      data: {
        botToken: config.botToken || "",
        chatId: config.chatId || "",
        isEnabled: config.isEnabled !== false,
      },
    });
  } catch (error) {
    console.error("[TELEGRAM_ROUTES] Get config error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
});

/**
 * POST /api/telegram/update-config
 * Strictly protected for Super Admin
 */
router.post("/update-config", superAdminAuthMiddleware, async (req, res) => {
  try {
    const { botToken, chatId, isEnabled } = req.body;

    let config = await telegramConfigModel.findOne().sort({ createdAt: -1 });

    if (config) {
      config.botToken = (botToken || "").trim();
      config.chatId = (chatId || "").trim();
      config.isEnabled = isEnabled !== false;
      await config.save();
    } else {
      config = await new telegramConfigModel({
        botToken: (botToken || "").trim(),
        chatId: (chatId || "").trim(),
        isEnabled: isEnabled !== false,
      }).save();
    }

    return res.status(200).send({
      success: true,
      message: "Telegram settings updated successfully",
      data: {
        botToken: config.botToken,
        chatId: config.chatId,
        isEnabled: config.isEnabled,
      },
    });
  } catch (error) {
    console.error("[TELEGRAM_ROUTES] Update config error:", error);
    return res.status(500).send({ success: false, message: "Failed to update Telegram settings" });
  }
});

/**
 * POST /api/telegram/test-notification
 * Test Telegram bot connection and message sending
 */
router.post("/test-notification", superAdminAuthMiddleware, async (req, res) => {
  try {
    const { botToken, chatId } = req.body;

    let targetToken = botToken;
    let targetChatId = chatId;

    if (!targetToken || !targetChatId) {
      const config = await telegramConfigModel.findOne().sort({ createdAt: -1 });
      if (config) {
        targetToken = targetToken || config.botToken;
        targetChatId = targetChatId || config.chatId;
      }
    }

    if (!targetToken || !targetChatId) {
      return res.status(400).send({
        success: false,
        message: "Bot Token and Chat ID are required to send a test message.",
      });
    }

    const testResult = await telegramService.sendTestNotification(targetToken, targetChatId);

    if (testResult.success) {
      return res.status(200).send({
        success: true,
        message: testResult.message,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: testResult.message,
      });
    }
  } catch (error) {
    console.error("[TELEGRAM_ROUTES] Test notification error:", error);
    return res.status(500).send({ success: false, message: "Error sending test notification" });
  }
});

module.exports = router;
