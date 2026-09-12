const mongoose = require("mongoose");

const pendingPaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["wallet", "order"],
      default: "order",
    },
    apiName: {
      type: String,
      default: "manual",
    },
    amount: {
      type: String,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      default: "Customer",
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerMobile: {
      type: String,
    },
    productName: {
      type: String,
    },
    userId: {
      type: String,
    },
    zoneId: {
      type: String,
    },
    productId: {
      type: String,
    },
    gameId: {
      type: String,
    },
    gameName: {
      type: String,
    },
    region: {
      type: String,
    },
    rawNote: {
      type: String,
    },
    couponId: {
      type: String,
    },
    couponName: {
      type: String,
    },
    discountApplied: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatically deletes after 24 hours
    },
  },
  {
    timestamps: true,
  }
);

const pendingPaymentModel = mongoose.model(
  "pending_payments",
  pendingPaymentSchema
);
module.exports = pendingPaymentModel;
