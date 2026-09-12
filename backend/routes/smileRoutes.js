const express = require("express");
const axios = require("axios");
const paymentModel = require("../models/paymentModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const authMiddleware = require("../middlewares/authMiddleware");
const md5 = require("md5");
const querystring = require("querystring");
const fs = require("fs");
const nodemailer = require("nodemailer");
const generalRateLimiter = require("../middlewares/generalRateLimiter");
const walletHistoryModel = require("../models/walletHistoryModel");
const userModel = require("../models/userModel");
const couponModel = require("../models/couponModel");
const sendOrderEmail = require("../controllers/sendOrderEmail");
const paymentGatewayService = require("../services/paymentGatewayService");
const pendingPaymentModel = require("../models/pendingPaymentModel");
const router = express.Router();

// UPI_GATEWAY
router.post("/create-order", generalRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { order_id, txn_note, product_name, customer_name, customer_email, customer_mobile, couponId } = req.body;

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

    if (!userid || !zoneid || !productid || !pname || !amount || !price || !order_id || !product_name || !customer_name || !customer_mobile) {
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
          apiName: "smileOne",
          amount: amount.toString(),
          finalPrice: finalPrice,
          customerName: finalCustomerName,
          customerEmail: customer_email,
          customerMobile: customer_mobile || "",
          productName: product_name,
          userId: userid,
          zoneId: zoneid,
          productId: productid,
          region: product_name,
          rawNote: txn_note,
          couponId: couponId || "",
          couponName: couponName || "",
          discountApplied: discountApplied || 0,
          status: "pending",
        },
      },
      { upsert: true, new: true }
    );

    const redirectUrl = `https://zelanstore.com/api/smile/check-status?order_id=${encodeURIComponent(order_id)}&client_txn_id=${encodeURIComponent(order_id)}&orderId=${encodeURIComponent(order_id)}`;

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

    console.log("[SMILE_CREATE_ORDER_RESULT]:", result);

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

router.all("/check-status", generalRateLimiter, async (req, res) => {
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

    console.log("[SMILE_STATUS_RESULT]:", statusResult);

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
      const region = pendingRecord?.region || data.p_info || "philliphines";
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

      let orderSuccess = false;

      // Attempt Smile.one API call
      try {
        const uid = process.env.UID;
        const email = process.env.EMAIL;
        const product = "mobilelegends";
        const time = Math.floor(Date.now() / 1000);
        const mKey = process.env.KEY;
        const productidArr = productids.split("&");

        const apiRequests = productidArr.map(async (id) => {
          const signArr = {
            uid,
            email,
            product,
            time,
            userid,
            zoneid,
            productid: id,
          };

          const sortedSignArr = Object.fromEntries(
            Object.entries(signArr).sort()
          );
          const str =
            Object.keys(sortedSignArr)
              .map((key) => `${key}=${sortedSignArr[key]}`)
              .join("&") +
            "&" +
            mKey;
          const sign = md5(md5(str));

          const formData = querystring.stringify({
            email,
            uid,
            userid,
            zoneid,
            product,
            productid: id,
            time,
            sign,
          });

          const apiUrl = `https://www.smile.one/${
            region === "brazil" ? "br" : "ph"
          }/smilecoin/api/createorder`;

          return axios.post(apiUrl, formData, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000,
          });
        });

        const responses = await Promise.all(apiRequests);
        orderSuccess = responses.every((r) => r.data && r.data.status === 200);
        console.log("[SMILE_API_RESPONSES]:", responses.map((r) => r.data));
      } catch (smileErr) {
        console.error("Smile.one API processing error:", smileErr.response ? smileErr.response.data : smileErr.message);
      }

      const orderData = {
        api: "yes",
        amount,
        orderId: effectiveOrderId,
        p_info: pname,
        price: txn_amount,
        customer_email,
        customer_mobile,
        playerId: userid,
        userId: userid,
        zoneId: zoneid,
        status: orderSuccess ? "success" : "pending",
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

      if (orderSuccess) {
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
          console.error("Email send error:", mailErr);
        }
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
    console.error("Smile check status error:", error);
    return res.redirect("https://zelanstore.com/orders?payment=error");
  }
});


// wallet
router.post("/wallet", generalRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { orderId, userid, zoneid, region, productid, customer_mobile, amount, price, pname, couponId } = req.body;

    if (!orderId || !userid || !zoneid || !region || !productid || !customer_mobile || !amount || !price || !pname) {
      return res.status(201).json({ message: "Invalid details" });
    }

    const customer_email = req.body.email

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
      const condition3 = item.id === productid;
  
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

    // Process API Order
    const uid = process.env.UID;
    const email = process.env.EMAIL;
    const product = "mobilelegends";
    const time = Math.floor(Date.now() / 1000);
    const mKey = process.env.KEY;
    const productIds  = productid.split("&");

    const apiRequests = productIds.map(async (id) => {
      const signArr = {
        uid,
        email,
        product,
        time,
        userid,
        zoneid,
        productid: id,
      };

      const sortedSignArr = Object.fromEntries(
        Object.entries(signArr).sort()
      );
      const str = Object.keys(sortedSignArr).map((key) => `${key}=${sortedSignArr[key]}`).join("&") + "&" + mKey;
      // const signStr = `uid=${uid}&email=${email}&product=${product}&time=${time}&userid=${userid}&zoneid=${zoneid}&productid=${id}&${mKey}`;
      const sign = md5(md5(str));

      const formData = querystring.stringify({
        email,
        uid,
        userid,
        zoneid,
        product,
        productid: id,
        time,
        sign,
      });

      const apiUrl = region === "brazil" ? "https://www.smile.one/br/smilecoin/api/createorder" : "https://www.smile.one/ph/smilecoin/api/createorder";
      return axios.post(apiUrl, formData, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    });

    // Wait for all API calls to complete
    const responses = await Promise.all(apiRequests);
    const orderSuccess = responses.every((res) => res.data.status === 200);

    console.log(responses.map((r) => r.data));
    // Save Order Details
    const orderStatus = orderSuccess ? "success" : "failed";


    // Prepare Order Data
    const orderData = {
      api: "yes",
      orderId,
      p_info: pname,
      price: finalPrice,
      amount,
      customer_email,
      customer_mobile,
      playerId: userid,
      userId: userid,
      zoneId: zoneid,
      status: orderStatus,
      paymentMode: "wallet",
    };

    // Add Discount Key Only If Applied
    if (discountApplied > 0) {
      orderData.discount = `${couponName} - ${discountApplied}Rs`;
    }

    // Save Order
    await new orderModel(orderData).save();

    // Send Order Email (only if successful)
    if (orderSuccess) {
      const orderDetails = { orderId, amount, price: finalPrice, pname, userid, zoneid };
      sendOrderEmail(orderDetails, customer_email);
      return res.status(200).json({ success: true, message: "Order Placed Successfully" });
    }

    return res.status(201).json({ success: false, message: "Order Failed" });   
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
