const axios = require("axios");
const telegramConfigModel = require("../models/telegramConfigModel");

class TelegramService {
  /**
   * Fetch active Telegram configuration from DB or .env fallback
   */
  async getConfig() {
    try {
      const config = await telegramConfigModel.findOne().sort({ createdAt: -1 });
      if (config && config.botToken && config.chatId) {
        return {
          botToken: config.botToken.trim(),
          chatId: config.chatId.trim(),
          isEnabled: config.isEnabled !== false,
        };
      }
    } catch (err) {
      console.error("[TELEGRAM_SERVICE] Error fetching config from DB:", err.message);
    }

    // Fallback to environment variables
    const envToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const envChatId = process.env.TELEGRAM_CHAT_ID || "";
    return {
      botToken: envToken.trim(),
      chatId: envChatId.trim(),
      isEnabled: true,
    };
  }

  /**
   * Format and send Manual Order alert to Telegram
   * @param {Object} orderData
   */
  async sendManualOrderAlert(orderData) {
    try {
      const config = await this.getConfig();
      if (!config.isEnabled || !config.botToken || !config.chatId) {
        console.log("[TELEGRAM_SERVICE] Telegram notifications are disabled or missing credentials.");
        return { success: false, message: "Disabled or credentials missing" };
      }

      const {
        orderId = "N/A",
        p_info = "N/A",
        amount = "N/A",
        price = "0",
        paymentMode = "UPI",
        playerId = "",
        userId = "",
        zoneId = "",
        customer_email = "N/A",
        customer_mobile = "N/A",
        discount = 0,
      } = orderData;

      const playerIdentifier = playerId || userId || "N/A";
      const zoneIdentifier = zoneId ? ` | Zone/Server: ${zoneId}` : "";
      const discountText = discount > 0 ? `\n🏷️ <b>Discount Applied:</b> ₹${discount}` : "";

      const messageText = `
🚨 <b>NEW MANUAL ORDER RECEIVED!</b>

📦 <b>Product:</b> ${p_info}
💎 <b>Package/Qty:</b> ${amount}
💰 <b>Price Paid:</b> ₹${price} (${paymentMode})${discountText}
🆔 <b>Order ID:</b> <code>${orderId}</code>

👤 <b>Player ID:</b> <code>${playerIdentifier}</code>${zoneIdentifier}
📧 <b>Customer Email:</b> ${customer_email}
📱 <b>Customer Mobile:</b> ${customer_mobile || "N/A"}
🕒 <b>Time:</b> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST

👉 <a href="https://zelanstore.com/admin-orders">Open Admin Orders Panel</a>
`.trim();

      const response = await axios.post(
        `https://api.telegram.org/bot${config.botToken}/sendMessage`,
        {
          chat_id: config.chatId,
          text: messageText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        },
        { timeout: 10000 }
      );

      if (response.data && response.data.ok) {
        console.log(`[TELEGRAM_SERVICE] Manual order alert sent successfully for order: ${orderId}`);
        return { success: true };
      } else {
        console.error("[TELEGRAM_SERVICE] Telegram API returned non-OK:", response.data);
        return { success: false, data: response.data };
      }
    } catch (error) {
      console.error("[TELEGRAM_SERVICE] Failed to send Telegram alert:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a test notification to verify credentials
   * @param {string} botToken
   * @param {string} chatId
   */
  async sendTestNotification(botToken, chatId) {
    try {
      if (!botToken || !chatId) {
        throw new Error("Bot Token and Chat ID are required.");
      }

      const testMessage = `
✅ <b>Zelan Store - Telegram Bot Test Message</b>

🔔 Your Telegram notification system is successfully connected!
🕒 <b>Sent At:</b> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST

Whenever a customer pays for a <b>Manual Order</b>, you will receive instant alerts here.
`.trim();

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken.trim()}/sendMessage`,
        {
          chat_id: chatId.trim(),
          text: testMessage,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        },
        { timeout: 10000 }
      );

      if (response.data && response.data.ok) {
        return { success: true, message: "Test message sent successfully to Telegram!" };
      } else {
        return { success: false, message: response.data?.description || "Failed to send message via Telegram API" };
      }
    } catch (error) {
      const errMsg = error.response?.data?.description || error.message;
      return { success: false, message: `Telegram Error: ${errMsg}` };
    }
  }
}

module.exports = new TelegramService();
