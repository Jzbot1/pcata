const mongoose = require("mongoose");

const paymentConfigSchema = new mongoose.Schema({
  gatewayName: {
    type: String,
    required: true,
    unique: true,
    default: "ACTIVE_GATEWAY",
  },
  gatewayType: {
    type: String,
    enum: ["JZSTORE", "UPIGATEWAY"],
    default: "JZSTORE",
  },
  apiUrl: {
    type: String,
    required: true,
    default: "https://checkout.pages.jzstore.in",
  },
  apiKey: {
    type: String,
    required: true,
    default: "509ffd178aff24dc09640796da90fc22",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const paymentConfigModel = mongoose.model("payment_configs", paymentConfigSchema);
module.exports = paymentConfigModel;
