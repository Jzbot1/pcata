const express = require("express");
const axios = require("axios");
const orderModel = require("../models/orderModel");
const paymentModel = require("../models/paymentModel");
const authMiddleware = require("../middlewares/authMiddleware");
const sendMail = require("../controllers/sendMail");
const fs = require("fs");
const nodemailer = require("nodemailer");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const couponModel = require("../models/couponModel");
const walletHistoryModel = require("../models/walletHistoryModel");
const paymentConfigModel = require("../models/paymentConfigModel");
const paymentGatewayService = require("../services/paymentGatewayService");

// Create an Express Router
const router = express.Router();
process.env.TZ = "Asia/Kolkata"; // Replace with 'Asia/Kolkata' for IST

// barcode
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const {
      order_id,
      txn_amount,
      txn_note,
      product_name,
      customer_name,
      customer_email,
      customer_mobile,
      couponId,
    } = req.body;

    // Fix very short customer name (less than 3 letters)
    let finalCustomerName = customer_name;
    if (!customer_name || customer_name.trim().length < 3) {
      finalCustomerName = `${customer_name}_ZelanStore`;
    }


    const [userid, zoneid, amount] = txn_note.split("@");
    const pp = await productModel.findOne({ name: product_name });
    if (!pp) {
      return res.status(404).json({ message: "Product not found" });
    }

    const priceExists = pp.cost.some(
      (item) =>
        item.amount === amount &&
        (Number(item.price) === Number(txn_amount) || (Number(item.resPrice) === Number(txn_amount)))
    );
    if (!priceExists) {
      return res.status(400).json({
        message: "Amount does not match",
      });
    }

    const existingOrder = await orderModel.findOne({
      orderId: order_id,
    });
    if (existingOrder) {
      return res.redirect("https://zelanstore.com/user-dashboard");
    }

    // Validate User
    const user = await userModel.findOne({ email: customer_email });
    if (!user) {
      return res.status(201).json({ success: false, message: "Invalid email" });
    }

    let finalPrice = Number(txn_amount);
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

    const redirectUrl = `https://zelanstore.com/api/manual/check-status`;

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

    console.log("[MANUAL_CREATE_ORDER_RESULT]:", result);

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
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/check-status", async (req, res) => {
  try {
    const { client_txn_id, order_id, orderId, txn_id } = req.query;
    const effectiveOrderId = (client_txn_id || order_id || orderId || "").toString();

    if(!effectiveOrderId){
      return res.status(400).json({ message: "transaction id not found" });
    }

    // Check if order exists
    if (await orderModel.findOne({ orderId: effectiveOrderId })) {
      return res.redirect("https://zelanstore.com/user-dashboard");
    }

    const statusResult = await paymentGatewayService.checkOrderStatus({
      orderId: effectiveOrderId,
      client_txn_id: effectiveOrderId,
    });

    console.log("[MANUAL_STATUS_RESULT]:", statusResult);

    if (statusResult.isSuccess) {
      const data = statusResult.data || {};
      const txn_amount = parseFloat(statusResult.amount || data.amount || 0);
      const order_id = statusResult.orderId || data.order_id || effectiveOrderId;
      const utr_number = statusResult.utr || data.upi_txn_id || data.utr || "none";
      const customer_name = data.customer_name || "Customer";
      const customer_email = data.customer_email || data.remark2 || "";
      const customer_mobile = data.customer_mobile || "";
      const pname = data.p_info || data.remark1 || "";
      const customer_vpa = data.customer_vpa || "none";
      const udf1 = data.udf1 || data.remark1 || "";
      const udf2 = data.udf2 || data.remark2 || "";

      let userid = "";
      let zoneid = "";
      let amount = "";

      if (udf1 && udf1.includes("@")) {
        const parts = udf1.split("@");
        userid = parts[0];
        zoneid = parts[1];
        amount = parts[2];
      }

      if (statusResult.isSuccess) {

        await new paymentModel({
          name: customer_name,
          email: customer_email,
          mobile: customer_mobile,
          amount: txn_amount,
          orderId: order_id,
          status: "success",
          type: "order",
          pname: pname,
          upi_txn_id: utr_number || "none",
          payerUpi: customer_vpa || "none",
        }).save();

        // Validate Product
        const pp = await productModel.findOne({ name: pname });
        if (!pp) {
          return res.status(201).json({ message: "Product not found" });
        }

        //CROSS CHECK PACKAGE PRICE AND GAME ID
        const priceExists = pp.cost.some(
          (item) =>
            item.amount === amount &&
            (Number(item.price) === Number(txn_amount) || (Number(item.resPrice) === Number(txn_amount)))
        );

        if (!priceExists) {
          return res.status(201).json({ message: "Amount does not match." });
        }
        
        // placing order
        const orderData = {
          api: "no",
          amount,
          orderId: order_id,
          p_info: pname,
          price: txn_amount,
          customer_email,
          customer_mobile,
          playerId: userid,
          userId: userid,
          zoneId: zoneid,
          status: "pending",
          paymentMode: "UPI",
          ...(udf2 && { discount: udf2 }), // Add Discount Key Only If Discount Applied
        };

        // Save Order
        await new orderModel(orderData).save();

        //! SEND MAIL TO USER
        try {
          const dynamicData = {
            orderId: `${order_id}`,
            amount: `${amount}`,
            price: `${txn_amount}`,
            p_info: `${pname}`,
            userId: `${userid}`,
            zoneId: `${zoneid}`,
          };
          let htmlContent = fs.readFileSync("order.html", "utf8");
          Object.keys(dynamicData).forEach((key) => {
            const placeholder = new RegExp(`{${key}}`, "g");
            htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
          });
          // Send mail
          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.MAIL,
              pass: process.env.APP_PASSWORD,
            },
          });
          let mailDetails = {
            from: process.env.MAIL,
            to: `${customer_email}`,
            subject: "Order Successful!",
            html: htmlContent,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log(err);
            }
          });
        } catch (error) {
          console.error("Error sending email:", error);
        }

        //! SENDING MAIL TO ADMIN
        const sub = "New Order Recieved";
        const msgg =
          `Hello Admin! You have received a new ${pname} order. Kindly login to see your order.`;
        await sendMail(process.env.CLIENT_EMAIL, sub, "", msgg);

        return res.redirect(`https://zelanstore.com/user-dashboard/`);
      } else {
        const orderData = {
          api: "no",
          amount,
          orderId: order_id,
          p_info: pname,
          price: txn_amount,
          customer_email,
          customer_mobile,
          playerId: userid,
          userId: userid,
          zoneId: zoneid,
          status: "failed",
          paymentMode: "UPI",
          ...(udf2 && { discount: udf2 }), // Add Discount Key Only If Discount Applied
        };

        // Save Order
        await new orderModel(orderData).save();
        return res.redirect("https://zelanstore.com/");
      }
    }
  } catch (error) {
    console.error("Internal Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// wallet
router.post("/wallet", authMiddleware, async (req, res) => {
  try {
    const { api, userid, zoneid, orderId, customer_email, customer_mobile, amount, price, pname, couponId } = req.body;

    if (!orderId || !userid || !zoneid || !customer_email || !customer_mobile || !amount || !price || !pname) {
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
    const priceExists = checkProduct.cost.some(
      (item) =>
        item.amount === amount &&
        (Number(item.price) === Number(price) || (Number(item.resPrice) === Number(price)))
    );

    if (!priceExists) {
      return res.status(201).json({ message: "Amount does not match." });
    }

    // Validate User and Wallet Balance
    const user = await userModel.findOne({ email: customer_email });

    if (!user) {
      return res.status(201).json({ success: false, message: "Invalid email" });
    }

    finalPrice = Number(finalPrice);

    if (finalPrice <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price, cannot proceed with zero or negative amount." });
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

    // Prepare Order Data
    const orderData = {
      api: "no",
      orderId,
      p_info: pname,
      price: finalPrice,
      amount,
      customer_email,
      customer_mobile,
      playerId: userid,
      userId: userid,
      zoneId: zoneid,
      status: "pending",
      paymentMode: "wallet",
    };

    // Add Discount Key Only If Applied
    if (discountApplied > 0) {
      orderData.discount = `${couponName} - ${discountApplied}Rs`;
    }

    // Save Order
    await new orderModel(orderData).save();

    
    //! SEND MAIL TO USER
    try {
      const dynamicData = {
        orderId: `${orderId}`,
        amount: `${amount}`,
        price: `${finalPrice}`,
        p_info: `${pname}`,
        userId: `${userid}`,
        zoneId: `${zoneid}`,
      };
      let htmlContent = fs.readFileSync("order.html", "utf8");
      Object.keys(dynamicData).forEach((key) => {
        const placeholder = new RegExp(`{${key}}`, "g");
        htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
      });
      // Send mail
      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL,
          pass: process.env.APP_PASSWORD,
        },
      });
      let mailDetails = {
        from: process.env.MAIL,
        to: `${customer_email}`,
        subject: "Order Successful!",
        html: htmlContent,
      };
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log(err);
        }
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }

    //! SENDING MAIL TO ADMIN
    const sub = "New Order Recieved";
    const msgg =
      `Hello Admin! You have received a new ${pname} order. Kindly login to see your order.`;
    await sendMail(process.env.CLIENT_EMAIL, sub, "", msgg);

    return res.status(200).json({ success: true, message: "Order Placed Successfully" });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
