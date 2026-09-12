const express = require("express");
const axios = require("axios");
const paymentModel = require("../models/paymentModel");
const userModel = require("../models/userModel");
const walletHistoryModel = require("../models/walletHistoryModel");
const paymentConfigModel = require("../models/paymentConfigModel");
const paymentGatewayService = require("../services/paymentGatewayService");
const authMiddleware = require("../middlewares/authMiddleware");
// Create an Express Router
const router = express.Router();
const qs = require("qs");

// add money to wallet
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      order_id,
      txn_amount,
      txn_note,
      product_name,
      customer_name,
      customer_email,
      customer_mobile,
      callback_url,
    } = req.body;

    const existingPayment = await paymentModel.findOne({
      orderId: order_id,
    });
    if (existingPayment) {
      return res.redirect("https://zelanstore.com/user-dashboard");
    }

    const response = await axios.post("https://pgateway.in/order/create", {
      token: process.env.API_TOKEN,
      order_id,
      txn_amount,
      txn_note,
      product_name,
      customer_name,
      customer_email,
      customer_mobile,
      callback_url,
    });

    if (response.data && response.data.status === false) {
      console.log(response.data);
      return res
        .status(201)
        .send({ success: false, message: response.data.message });
    }
    return res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/status", async (req, res) => {
  try {
    const { orderId } = req.query;
    const existingPayment = await paymentModel.findOne({
      orderId: orderId,
    });
    if (existingPayment) {
      return res.redirect("https://zelanstore.com/user-dashboard");
    }
    const orderStatusResponse = await axios.post(
      "https://pgateway.in/order/status",
      {
        token: process.env.API_TOKEN,
        order_id: orderId,
      }
    );
    if (orderStatusResponse.data.status) {
      const transactionDetails = orderStatusResponse.data.results;
      if (transactionDetails.status === "Success") {
        const {
          order_id,
          txn_note,
          customer_email,
          customer_mobile,
          txn_amount,
          product_name,
          utr_number,
          customer_name,
        } = transactionDetails;

        // saving payment
        const paymentObject = {
          name: customer_name,
          email: customer_email,
          mobile: customer_mobile,
          amount: txn_amount,
          orderId: order_id,
          status: transactionDetails.status,
          upi_txn_id: utr_number,
          type: "addmoney",
        };
        const newPayment = new paymentModel(paymentObject);
        await newPayment.save();

        const user = await userModel.findOne({
          email: customer_email,
        });

        if (user) {
          // Calculate bonus (1% of txn_amount if txn_amount >= 100)
          const txnAmount = parseFloat(txn_amount) || 0;
          const currentBalance = parseFloat(user?.balance) || 0;

          const newBalance = currentBalance + txnAmount;

          const updatedUser = await userModel.findOneAndUpdate(
            { email: customer_email },
            {
              $set: {
                balance:  parseFloat(user.balance) + txnAmount,  // without bonus add ho raha hai 
              },
            },
            { new: true }
          );

          // Prepare wallet history data
          const historyData = {
            orderId: order_id,
            email: customer_email,
            balanceBefore: user?.balance,
            balanceAfter: newBalance,
            price: `+${txn_amount}`,
            p_info: product_name,
            type: "addmoney",
          };

          // Add bonus only if it's greater than 0
          // if (bonusAmount > 0) {
          //   historyData.bonus = `+${bonusAmount.toFixed(2)}`;
          // }

          // Save history
          const history = new walletHistoryModel(historyData);
          await history.save();

          if (updatedUser) {
            return res.redirect(`https://zelanstore.com/wallet`);
          }
        }
      }
    } else {
      console.error("OrderID Not Found");
      return res.status(404).json({ error: "OrderID Not Found" });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// add money to wallet, Dynamic Gateway (JZStore / UPIGateway)
router.post("/create-payment", authMiddleware, async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentNote,
      customerName,
      customerEmail,
      customerNumber,
    } = req.body;

    const redirectUrl = `https://zelanstore.com/api/wallet/check-payment-status`;

    const result = await paymentGatewayService.createOrder({
      orderId,
      amount,
      customerName,
      customerEmail,
      customerMobile: customerNumber,
      redirectUrl,
      note: paymentNote || "Wallet Topup",
      remark1: "Wallet Topup",
      remark2: customerEmail,
    });

    console.log("[WALLET_CREATE_PAYMENT_RESULT]:", result);

    if (result.success && result.payment_url) {
      return res.status(200).send({
        success: true,
        data: { payment_url: result.payment_url, ...result.data },
      });
    } else {
      return res.status(201).send({
        success: false,
        message: result.message || "Error in initiating payment",
      });
    }
  } catch (error) {
    console.error("Wallet create payment error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/check-payment-status", async (req, res) => {
  try {
    const { client_txn_id, order_id, orderId, txn_id } = req.query;
    const effectiveOrderId = (client_txn_id || order_id || orderId || "").toString();

    if (!effectiveOrderId) {
      return res.redirect(`${process.env.BASE_URL || "https://zelanstore.com"}/failure`);
    }

    const existingPayment = await paymentModel.findOne({
      orderId: effectiveOrderId,
    });

    if (existingPayment) {
      return res.redirect(`https://zelanstore.com/wallet`);
    }

    const statusResult = await paymentGatewayService.checkOrderStatus({
      orderId: effectiveOrderId,
      client_txn_id: effectiveOrderId,
    });

    console.log("[WALLET_STATUS_RESULT]:", statusResult);

    if (statusResult.isSuccess) {
      const data = statusResult.data || {};
      const txnAmount = parseFloat(statusResult.amount || data.amount || 0);
      const utr = statusResult.utr || data.upi_txn_id || data.utr || "none";
      const customerEmail = data.customer_email || data.remark2 || (req.query.email || "");

      const paymentObject = {
        orderId: effectiveOrderId,
        name: data.customer_name || "Customer",
        email: customerEmail,
        mobile: data.customer_mobile || "",
        amount: txnAmount,
        status: "success",
        type: "wallet",
        pname: "Wallet Topup",
        upi_txn_id: utr,
        payerUpi: data.customer_vpa || "none",
      };

      const newPayment = new paymentModel(paymentObject);
      await newPayment.save();

      let user = null;
      if (customerEmail) {
        user = await userModel.findOne({ email: customerEmail });
      }

      if (user) {
        const currentBalance = parseFloat(user?.balance) || 0;
        const newBalance = currentBalance + txnAmount;

        await userModel.findOneAndUpdate(
          { _id: user._id },
          { $inc: { balance: txnAmount } },
          { new: true }
        );

        const newHistory = new walletHistoryModel({
          orderId: effectiveOrderId,
          email: user.email,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          price: `+${txnAmount}`,
          p_info: "Wallet",
          type: "addmoney",
        });
        await newHistory.save();
      }

      return res.redirect(`https://zelanstore.com/wallet`);
    } else {
      return res.redirect(`${process.env.BASE_URL || "https://zelanstore.com"}/failure`);
    }
  } catch (error) {
    console.error("Wallet check status error:", error);
    res.redirect(`${process.env.BASE_URL || "https://zelanstore.com"}/failure`);
  }
});

// WEBHOOK RECEIVER FOR INSTANT NOTIFICATIONS
router.post("/webhook", async (req, res) => {
  try {
    const rawPayload = req.body;
    console.log("[GATEWAY_WEBHOOK] Received:", JSON.stringify(rawPayload));

    const resultObj = rawPayload.result || rawPayload.data || rawPayload;
    const rawStatus = (resultObj.status || "").toString().toUpperCase();
    const orderId = (resultObj.orderId || resultObj.order_id || resultObj.client_txn_id || "").toString();
    const amount = parseFloat(resultObj.amount || 0);
    const utr = (resultObj.utr || resultObj.upi_txn_id || "").toString();

    if (["SUCCESS", "COMPLETED"].includes(rawStatus) && orderId) {
      const existingPayment = await paymentModel.findOne({ orderId });
      if (!existingPayment) {
        const customerEmail = resultObj.remark2 || resultObj.customer_email || "";
        let user = customerEmail ? await userModel.findOne({ email: customerEmail }) : null;

        await new paymentModel({
          orderId,
          name: resultObj.customer_name || user?.name || "Customer",
          email: customerEmail || user?.email || "",
          mobile: resultObj.customer_mobile || user?.mobile || "",
          amount,
          status: "success",
          type: "wallet",
          pname: "Wallet Topup",
          upi_txn_id: utr || "none",
        }).save();

        if (user) {
          const currentBalance = parseFloat(user.balance) || 0;
          const newBalance = currentBalance + amount;

          await userModel.findOneAndUpdate(
            { _id: user._id },
            { $inc: { balance: amount } },
            { new: true }
          );

          await new walletHistoryModel({
            orderId,
            email: user.email,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            price: `+${amount}`,
            p_info: "Wallet Topup",
            type: "addmoney",
          }).save();
        }
      }

      return res.status(200).json({ status: "acknowledged", orderId });
    }

    return res.status(400).json({ error: "invalid_webhook_payload" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

module.exports = router;