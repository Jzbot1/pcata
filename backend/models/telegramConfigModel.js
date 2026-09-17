const mongoose = require("mongoose");

const telegramConfigSchema = new mongoose.Schema(
  {
    botToken: {
      type: String,
      default: "",
      trim: true,
    },
    chatId: {
      type: String,
      default: "",
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const telegramConfigModel = mongoose.model(
  "telegram_config",
  telegramConfigSchema
);

module.exports = telegramConfigModel;
