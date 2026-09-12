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

const pendingPaymentModel = require("../models/pendingPaymentModel");

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

    const finalAmount = parseFloat(amount);
    if (!finalAmount || finalAmount < 1) {
      return res.status(400).send({
        success: false,
        message: "Invalid amount. Minimum amount is ₹1.",
      });
    }

    const redirectUrl = `https://zelanstore.com/api/wallet/check-payment-status`;

    // Save pending payment record to maintain context
    await pendingPaymentModel.findOneAndUpdate(
      { orderId: orderId.toString() },
      {
        $set: {
          orderId: orderId.toString(),
          type: "wallet",
          apiName: "wallet",
          amount: finalAmount.toString(),
          finalPrice: finalAmount,
          customerName: customerName || "Customer",
          customerEmail: customerEmail || "",
          customerMobile: customerNumber || "",
          productName: "Wallet Topup",
          rawNote: paymentNote || "Wallet Topup",
          status: "pending",
        },
      },
      { upsert: true, new: true }
    );

    const result = await paymentGatewayService.createOrder({
      orderId,
      amount: finalAmount,
      customerName: customerName || "Customer",
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

router.all("/check-payment-status", async (req, res) => {
  try {
    const query = req.query || {};
    const body = req.body || {};

    const effectiveOrderId = (
      query.client_txn_id ||
      query.order_id ||
      query.orderId ||
      query.txn_id ||
      query.idtrx ||
      body.client_txn_id ||
      body.order_id ||
      body.orderId ||
      body.txn_id ||
      body.idtrx ||
      ""
    ).toString();

    console.log("[WALLET_CHECK_PAYMENT_STATUS] Received orderId:", effectiveOrderId, "Query:", query, "Body:", body);

    if (!effectiveOrderId) {
      return res.redirect(`https://zelanstore.com/wallet?payment=failed&msg=MissingOrderId`);
    }

    // Check if already credited
    const existingPayment = await paymentModel.findOne({
      orderId: effectiveOrderId,
    });

    if (existingPayment) {
      return res.redirect(`https://zelanstore.com/wallet?payment=success&orderId=${effectiveOrderId}`);
    }

    const pendingRecord = await pendingPaymentModel.findOne({
      orderId: effectiveOrderId,
    });

    const statusResult = await paymentGatewayService.checkOrderStatus({
      orderId: effectiveOrderId,
      client_txn_id: effectiveOrderId,
    });

    console.log("[WALLET_STATUS_RESULT]:", statusResult);

    if (statusResult.isSuccess) {
      const data = statusResult.data || {};
      const txnAmount =
        parseFloat(statusResult.amount) ||
        parseFloat(data.amount) ||
        parseFloat(pendingRecord?.finalPrice) ||
        0;

      const utr =
        statusResult.utr ||
        data.upi_txn_id ||
        data.utr ||
        data.bank_ref_num ||
        "none";

      const customerEmail =
        pendingRecord?.customerEmail ||
        data.customer_email ||
        data.remark2 ||
        query.email ||
        body.email ||
        "";

      const customerName =
        pendingRecord?.customerName ||
        data.customer_name ||
        "Customer";

      const customerMobile =
        pendingRecord?.customerMobile ||
        data.customer_mobile ||
        "";

      const paymentObject = {
        orderId: effectiveOrderId,
        name: customerName,
        email: customerEmail,
        mobile: customerMobile,
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

      if (user && txnAmount > 0) {
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
          p_info: "Wallet Topup",
          type: "addmoney",
        });
        await newHistory.save();
      }

      if (pendingRecord) {
        await pendingPaymentModel.updateOne(
          { orderId: effectiveOrderId },
          { $set: { status: "success" } }
        );
      }

      return res.redirect(`https://zelanstore.com/wallet?payment=success&orderId=${effectiveOrderId}`);
    } else {
      if (pendingRecord) {
        await pendingPaymentModel.updateOne(
          { orderId: effectiveOrderId },
          { $set: { status: "failed" } }
        );
      }
      return res.redirect(`https://zelanstore.com/wallet?payment=failed&orderId=${effectiveOrderId}&status=${encodeURIComponent(statusResult.status || "FAILED")}`);
    }
  } catch (error) {
    console.error("Wallet check status error:", error);
    res.redirect(`https://zelanstore.com/wallet?payment=error`);
  }
});

// WEBHOOK RECEIVER FOR INSTANT NOTIFICATIONS
router.post("/webhook", async (req, res) => {
  try {
    const rawPayload = req.body;
    console.log("[GATEWAY_WEBHOOK] Received:", JSON.stringify(rawPayload));

    const resultObj = rawPayload.result || rawPayload.data || rawPayload;
    const rawStatus = (
      resultObj.txnStatus ||
      resultObj.status ||
      rawPayload.status ||
      ""
    )
      .toString()
      .toUpperCase();

    const orderId = (
      resultObj.orderId ||
      resultObj.order_id ||
      resultObj.client_txn_id ||
      rawPayload.order_id ||
      rawPayload.orderId ||
      ""
    ).toString();

    const isSuccess =
      [
        "SUCCESS",
        "TXN_SUCCESS",
        "COMPLETED",
        "PAID",
        "TRUE",
        "OK",
        "200",
      ].includes(rawStatus) ||
      rawStatus.includes("SUCCESS") ||
      rawStatus.includes("COMPLET");

    if (isSuccess && orderId) {
      const existingPayment = await paymentModel.findOne({ orderId });
      if (!existingPayment) {
        const pendingRecord = await pendingPaymentModel.findOne({ orderId });

        const amount =
          parseFloat(resultObj.amount) ||
          parseFloat(resultObj.txn_amount) ||
          parseFloat(pendingRecord?.finalPrice) ||
          0;

        const utr = (
          resultObj.utr ||
          resultObj.upi_txn_id ||
          resultObj.utr_number ||
          "none"
        ).toString();

        const customerEmail =
          pendingRecord?.customerEmail ||
          resultObj.remark2 ||
          resultObj.customer_email ||
          "";

        let user = customerEmail
          ? await userModel.findOne({ email: customerEmail })
          : null;

        await new paymentModel({
          orderId,
          name:
            pendingRecord?.customerName ||
            resultObj.customer_name ||
            user?.name ||
            "Customer",
          email: customerEmail || user?.email || "",
          mobile:
            pendingRecord?.customerMobile ||
            resultObj.customer_mobile ||
            user?.mobile ||
            "",
          amount,
          status: "success",
          type: "wallet",
          pname: "Wallet Topup",
          upi_txn_id: utr || "none",
        }).save();

        if (user && amount > 0) {
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

        if (pendingRecord) {
          await pendingPaymentModel.updateOne(
            { orderId },
            { $set: { status: "success" } }
          );
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