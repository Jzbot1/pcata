const express = require("express");
const axios = require("axios");
const paymentModel = require("../models/paymentModel");
const productModel = require("../models/productModel");
const walletHistoryModel = require("../models/walletHistoryModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const fs = require("fs");
const md5 = require("md5");
const querystring = require("querystring");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const browserMiddleware = require("../middlewares/browserMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const qs = require("qs");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const generalRateLimiter = require("../middlewares/generalRateLimiter");
const sendOrderEmail = require("../controllers/sendOrderEmail");
const paymentGatewayService = require("../services/paymentGatewayService");
const pendingPaymentModel = require("../models/pendingPaymentModel");
const couponModel = require("../models/couponModel");


router.post("/get-yokcash", browserMiddleware, async (req, res) => {
  try {
    const url = "https://api.yokcash.com/service";
    const response = await axios.post(
      url,
      {
        api_key: process.env.YOKCASH_API, // JSON body
      },
      {
        headers: {
          "Content-Type": "application/json", // MUST
        },
      }
    );
    
    // Filter services by category (gameName from frontend)
    const mobileLegendsServices = response.data.data?.filter(
      (service) => service.kategori === req.body.gameName
    );

    return res.status(200).json({
      success: true,
      message: "Yokcash Services Fetched",
      data: mobileLegendsServices,
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, msg: error.message });
  }
});

router.get("/get-yokcash-balance", adminAuthMiddleware, async (req, res) => {
  try {
    const url = "https://api.yokcash.com/saldo";

    const response = await axios.post(
      url,
      {
        api_key: process.env.YOKCASH_API, // JSON body
      },
      {
        headers: {
          "Content-Type": "application/json", // IMPORTANT
        },
      }
    );

    return res.status(200).json({
      success: response?.data?.status,
      message: response?.data?.msg,
      data: response?.data?.data.saldo || null,
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, msg: error.message });
  }
});

// UPI_GATEWAY
router.post("/create-order", generalRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { order_id, txn_note, customer_name, customer_email, customer_mobile, couponId } = req.body;

    // Fix very short customer name (less than 3 letters)
    let finalCustomerName = customer_name;
    if (!customer_name || customer_name.trim().length < 3) {
      finalCustomerName = `${customer_name}_ZelanStore`;
    }

    // Check if order already exists
    if (await orderModel.findOne({ orderId: order_id })) {
      return res.status(201).send({ success: false, message: "Order already exists" });
    }
    
    // Extract Data from txn_note
    const [userid, zoneid, productid, pname, amount, price] = txn_note.split("@");

    if (!userid || !zoneid || !productid || !pname || !amount || !price || !order_id || !customer_name || !customer_mobile) {
      return res.status(201).send({ success: false, message: "Invalid Details" });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price, cannot proceed with zero or negative amount." });
    }

    // Validate User
    const user = await userModel.findOne({ email: customer_email });
    if (!user) {
      return res.status(201).json({ success: false, message: "Invalid email" });
    }

    if (!txn_note || txn_note.split("@").length < 6) {
      return res.status(400).json({ success: false, message: "Invalid transaction note format" });
    }

    // Validate Product
    const checkProduct = await productModel.findOne({ name: pname });
    if (!checkProduct) {
      return res.status(201).json({ message: "Product not found" });
    }

    //CROSS CHECK PACKAGE PRICE AND GAME ID
    const priceExists = checkProduct.cost.some((item) => {
      return (
        item.amount === amount &&
        item.id === productid &&
        (Number(item.price) === Number(price) || Number(item.resPrice) === Number(price))
      );
    });

    if (!priceExists) {
      return res.status(201).json({ message: "Amount does not match." });
    }

    let finalPrice = Number(price);

    // Apply Coupon Discount (if available)
    let discountApplied = 0;
    let couponName = "";

    // Apply Coupon Discount
    if (couponId) {
      const coupon = await couponModel.findById(couponId);
      if (coupon && finalPrice >= coupon.minValue) {
        discountApplied = coupon.discount || 0;
        couponName = coupon.name || "";
        finalPrice -= discountApplied;
      }
    }

    // Save pending payment record
    await pendingPaymentModel.findOneAndUpdate(
      { orderId: order_id.toString() },
      {
        $set: {
          orderId: order_id.toString(),
          type: "order",
          apiName: "yokcash",
          amount: amount.toString(),
          finalPrice: finalPrice,
          customerName: finalCustomerName,
          customerEmail: customer_email,
          customerMobile: customer_mobile || "",
          productName: pname,
          userId: userid,
          zoneId: zoneid,
          productId: productids,
          rawNote: txn_note,
          couponId: couponId || "",
          couponName: couponName || "",
          discountApplied: discountApplied || 0,
          status: "pending",
        },
      },
      { upsert: true, new: true }
    );

    const redirectUrl = `https://zelanstore.com/api/yok/check-status?order_id=${encodeURIComponent(order_id)}&client_txn_id=${encodeURIComponent(order_id)}&orderId=${encodeURIComponent(order_id)}`;

    const result = await paymentGatewayService.createOrder({
      orderId: order_id,
      amount: finalPrice,
      customerName: finalCustomerName,
      customerEmail: customer_email,
      customerMobile: customer_mobile,
      redirectUrl,
      note: txn_note,
      remark1: txn_note,
      remark2: discountApplied > 0 ? `${couponName} - ${discountApplied}Rs` : "",
    });

    console.log("[YOKCASH_CREATE_ORDER_RESULT]:", result);

    if (result.success && result.payment_url) {
      return res.status(200).send({
        success: true,
        data: { payment_url: result.payment_url, ...result.data },
      });
    } else {
      return res.status(201).send({
        success: false,
        data: result.message || "Error in initiating payment",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || error });
  }
});

// GATEWAY CHECK STATUS
router.all("/check-status", async (req, res) => {
  try {
    const query = req.query || {};
    const body = req.body || {};

    let effectiveOrderId = (
      query.client_txn_id ||
      query.order_id ||
      query.orderId ||
      query.txn_id ||
      query.idtrx ||
      query.id ||
      body.client_txn_id ||
      body.order_id ||
      body.orderId ||
      body.txn_id ||
      body.idtrx ||
      body.id ||
      ""
    ).toString().trim();

    if (!effectiveOrderId && req.originalUrl) {
      const match = req.originalUrl.match(/[?&](?:order_id|orderId|client_txn_id|txn_id)=([^&#]+)/i);
      if (match && match[1]) {
        effectiveOrderId = decodeURIComponent(match[1]).trim();
      }
    }

    if (!effectiveOrderId) {
      return res.redirect("https://zelanstore.com/orders?payment=failed&msg=MissingOrderId");
    }

    // Check if order exists
    if (await orderModel.findOne({ orderId: effectiveOrderId })) {
      return res.redirect(`https://zelanstore.com/orders?payment=success&orderId=${effectiveOrderId}`);
    }

    const pendingRecord = await pendingPaymentModel.findOne({
      orderId: effectiveOrderId,
    });

    const statusResult = await paymentGatewayService.checkOrderStatus({
      orderId: effectiveOrderId,
      client_txn_id: effectiveOrderId,
    });

    console.log("[YOKCASH_STATUS_RESULT]:", statusResult);

    if (statusResult.isSuccess) {
      const data = statusResult.data || {};
      const txn_amount =
        parseFloat(statusResult.amount) ||
        parseFloat(data.amount) ||
        parseFloat(pendingRecord?.finalPrice) ||
        0;

      const utr_number =
        statusResult.utr ||
        data.upi_txn_id ||
        data.utr ||
        data.bank_ref_num ||
        "none";

      const customer_name =
        pendingRecord?.customerName ||
        data.customer_name ||
        "Customer";

      const customer_email =
        pendingRecord?.customerEmail ||
        data.customer_email ||
        data.remark2 ||
        "";

      const customer_mobile =
        pendingRecord?.customerMobile ||
        data.customer_mobile ||
        "";

      const pname =
        pendingRecord?.productName ||
        data.p_info ||
        "";

      const userid = pendingRecord?.userId || "";
      const zoneid = pendingRecord?.zoneId || "";
      const productids = pendingRecord?.productId || "";
      const amount = pendingRecord?.amount || "";
      const discount = pendingRecord?.discountApplied > 0 ? `${pendingRecord.couponName} - ${pendingRecord.discountApplied}Rs` : "";

      // Save Payment Record
      await new paymentModel({
        name: customer_name,
        email: customer_email,
        mobile: customer_mobile,
        amount: txn_amount,
        orderId: effectiveOrderId,
        status: "success",
        type: "order",
        pname: pname,
        upi_txn_id: utr_number,
        payerUpi: data.customer_vpa || "none",
      }).save();

      let yokcashOrderId = "";
      let yokcashStatus = "pending";

      try {
        const API_KEY = process.env.YOKCASH_API;
        const url = "https://api.yokcash.com/order";
        const productidArr = productids.split("&");

        for (let i = 0; i < productidArr.length; i++) {
          const uniqueOrderId = `${effectiveOrderId}-${i}`;

          const resp = await axios.post(
            url,
            {
              api_key: API_KEY,
              service_id: productidArr[i],
              target: zoneid && zoneid !== "none" ? `${userid}|${zoneid}` : userid,
              kontak: customer_mobile || "9999999999",
              idtrx: uniqueOrderId,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 15000,
            }
          );

          if (resp.data && resp.data.data) {
            yokcashOrderId = resp.data.data.id || "";
            if (resp.data.status) {
              yokcashStatus =
                resp.data.data.status &&
                resp.data.data.status.toLowerCase() === "processing"
                  ? "pending"
                  : resp.data.data.status || "success";
            }
          }
        }
      } catch (yokErr) {
        console.error("Yokcash API error:", yokErr.response ? yokErr.response.data : yokErr.message);
      }

      const orderData = {
        api: "yes",
        apiName: "yokcash",
        amount: amount,
        orderId: effectiveOrderId,
        p_info: pname,
        price: txn_amount,
        status: yokcashStatus || "pending",
        yid: yokcashOrderId,
        customer_email,
        customer_mobile,
        playerId: userid,
        userId: userid,
        zoneId: zoneid,
        paymentMode: "UPI",
        ...(discount && { discount }),
      };

      await new orderModel(orderData).save();

      if (pendingRecord) {
        await pendingPaymentModel.updateOne(
          { orderId: effectiveOrderId },
          { $set: { status: "success" } }
        );
      }

      try {
        const orderDetails = {
          orderId: effectiveOrderId,
          amount,
          price: txn_amount,
          pname,
          userid,
          zoneid,
        };
        sendOrderEmail(orderDetails, customer_email);
      } catch (mailErr) {
        console.error("Mail send error:", mailErr);
      }

      return res.redirect(`https://zelanstore.com/orders?payment=success&orderId=${effectiveOrderId}`);
    } else {
      if (pendingRecord) {
        await pendingPaymentModel.updateOne(
          { orderId: effectiveOrderId },
          { $set: { status: "failed" } }
        );
      }
      return res.redirect(`https://zelanstore.com/orders?payment=failed&orderId=${effectiveOrderId}&status=${encodeURIComponent(statusResult.status || "FAILED")}`);
    }
  } catch (error) {
    console.error("Yokcash check status error:", error);
    return res.redirect("https://zelanstore.com/orders?payment=error");
  }
});

// wallet
router.post("/wallet", authMiddleware, async (req, res) => {
  try {
    const { orderId, userid, zoneid, productids, customer_email, customer_mobile, amount, price, pname, couponId } = req.body;
    
    if (!orderId || !userid || !zoneid || !productids || !customer_mobile || !amount || !price || !pname) {
      return res.status(201).json({ message: "Invalid details" });
    }

    //CHECK IF ORDER AVAILABLE
    const order = await orderModel.findOne({ orderId });
    if (order) {
      return res.status(201).json({ message: "Please refresh you page" });
    } 

    // Validate Product
    const checkProduct = await productModel.findOne({ name: pname });
    if (!checkProduct) {
      return res.status(201).json({ message: "Product not found" });
    }


    //CROSS CHECK PACKAGE PRICE AND GAME ID
    const priceExists = checkProduct.cost.some((item) => {
      const condition1 = item.amount === amount;
      const condition2 = Number(item.price) === Number(price) || Number(item.resPrice) === Number(price);
      const condition3 = item.id === productids;
  
      const finalCheck = condition1 && (condition2) && condition3;
  
      return finalCheck;
    });


    if (!priceExists) {
      return res.status(201).json({ message: "Amount does not match." });
    }

    // Validate User and Wallet Balance
    const user = await userModel.findOne({ email: customer_email });
    if (!user) {
      return res.status(201).json({ success: false, message: "Invalid email" });
    }

    let finalPrice = Number(price);
    finalPrice = finalPrice.toFixed(2);

    if (finalPrice <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price, cannot proceed with zero or negative amount." });
    }
    
    if (Number(user.balance.toFixed(2)) < Number(finalPrice)) {
      return res.status(201).json({ success: false, message: "Insufficient balance" });
    }

    // Apply Coupon Discount (if available)
    let discountApplied = 0;
    let couponName = "";

    if (couponId) {
      const coupon = await couponModel.findById(couponId);
      if (coupon) {
        if (finalPrice >= coupon.minValue) {
          discountApplied = coupon.discount || 0;
          couponName = coupon.name || "";
          finalPrice -= discountApplied;
        }
      }
    }

    finalPrice = Number(finalPrice);

    if (finalPrice <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price, cannot proceed with zero or negative amount." });
    }

    // Atomic Deduct Balance & Save Wallet History
    const updatedUser = await userModel.findOneAndUpdate(
      { email: customer_email, balance: { $gte: finalPrice } },
      { $inc: { balance: -finalPrice } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const newBalance = updatedUser.balance;
    const balanceBefore = newBalance + finalPrice;

    await new walletHistoryModel({
      orderId,
      email: customer_email,
      balanceBefore: balanceBefore,
      balanceAfter: newBalance,
      price: `-${finalPrice}`,
      p_info: pname,
      type: "order",
    }).save();

    const API_KEY = process.env.YOKCASH_API;
    const url = "https://api.yokcash.com/order";
    const productid = productids.split("&");

    let response;
    for (let i = 0; i < productid.length; i++) {
      try {
        const uniqueOrderId = `${orderId}-${i}`;

        const resp = await axios.post(
          url,
          {
            api_key: API_KEY,
            service_id: productid[i],
            target: zoneid ? `${userid}|${zoneid}` : userid,
            kontak: customer_mobile,
            idtrx: uniqueOrderId,
            callback: "https://yourwebsite.com/callback/yokcash",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        response = resp.data;
      } catch (error) {
        console.error("Error placing order with Yokcash:", error.response.data.msg);
        return res.status(500).json({
          message: error.response.data.msg
        });
      }
    }


    if (!response.status) {
      const orderData = {
        api: "yes",
        apiName: "yokcash",
        amount: amount,
        orderId: orderId,
        p_info: pname,
        price: finalPrice,
        customer_email,
        customer_mobile,  
        playerId: userid,
        userId: userid,
        zoneId: zoneid, 
        status: "failed",
        paymentMode: "wallet",
      };

      // Add Discount Key Only If Applied
      if (discountApplied > 0) {
        orderData.discount = `${couponName} - ${discountApplied}Rs`;
      }
      // Save Order
      await new orderModel(orderData).save();

      console.error("Error placing order:", response.data.msg);
      
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Server Error</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              background: #f4f6ff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }

            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 450px;
            }

            h1 {
              color: #e63946;
              font-size: 48px;
              margin: 0;
            }

            p {
              color: #555;
              margin: 15px 0 25px 0;
            }

            a {
              text-decoration: none;
              background: #4f46e5;
              color: white;
              padding: 10px 18px;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
            }

            a:hover {
              background: #4338ca;
            }

            .emoji {
              font-size: 50px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">⚠️</div>
            <h1>500</h1>
            <h3>Server Error</h3>
            <p>Sorry, there was a problem while placing your order.</p>
            <a href="/">Go Back Home</a>
          </div>
        </body>
        </html>
      `);
    }

    const yokcashStatus =
      response.data.status && response.data.status.toLowerCase() === "processing"
        ? "pending"
        : response.data.status;

    const orderSave = new orderModel({
        api: "yes",
        apiName: "yokcash",
        amount: amount,
        orderId: orderId,
        p_info: pname,
        price: finalPrice,
        customer_email,
        customer_mobile,  
        playerId: userid,
        yid: response.data.id,
        userId: userid,
        zoneId: zoneid, 
        status: yokcashStatus || "pending",
        paymentMode: "wallet",
    }).save();

    // Send Order Email (only if successful)
    if (yokcashStatus) {
      const orderDetails = { orderId, amount, price: finalPrice, pname, userid, zoneid };
      sendOrderEmail(orderDetails, customer_email);
      return res.status(200).json({ success: true, message: "Order Placed Successfully" });
    }

  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
