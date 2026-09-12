const cron = require("node-cron");
const axios = require("axios");
const orderModel = require("../models/orderModel");

const checkYokcashOrderStatus = async () => {
  try {
    const orders = await orderModel.find({
      apiName: "yokcash",
      status: { $in: ["pending", "processing"] },
    });

    if (orders.length === 0) {
      return;
    }

    await Promise.all(
      orders.map(async (order) => {
        try {
          const url = "https://api.yokcash.com/status";

          const response = await axios.post(
            url,
            {
              api_key: process.env.YOKCASH_API,
              order_id: order.yid,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              validateStatus: () => true,
              timeout: 15000,
            }
          );

          const result = response.data;

          if (result?.status && result?.data?.status) {
            const finalStatus = result.data.status === "refund" ? "failed" : result.data.status;

            await orderModel.findByIdAndUpdate(order._id, { status: finalStatus });
            console.log(`✅ Updated yokcash order ${order.orderId}: ${finalStatus}`);
          }
        } catch (err) {
          if (err.response) {
            console.error(`❌ API error for order ${order.orderId}:`, err.response.data);
          } else {
            console.error(`❌ Error checking order ${order.orderId}:`, err.message);
          }
        }
      })
    );
  } catch (error) {
    console.error("❌ Yokcash cron job failed:", error.message);
  }
};

// 🕒 Run every 1 minute
cron.schedule("* * * * *", checkYokcashOrderStatus);

module.exports = checkYokcashOrderStatus;
