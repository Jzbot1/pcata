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

    const redirectUrl = `https://zelanstore.com/api/smile/check-status`;
    // const redirectUrl = `http://localhost:8080/api/smile/check-status`;
    
    const response = await axios.post(
      "https://api.ekqr.in/api/create_order",
      {
        key: process.env.UPIGATEWAY_API_KEY,
        client_txn_id: order_id.toString(),
        amount: finalPrice.toString(),
        p_info : product_name,
        customer_name: finalCustomerName,
        customer_email: customer_email,
        customer_mobile : customer_mobile,
        redirect_url: redirectUrl,
        udf1: txn_note,
        udf2: discountApplied > 0 ? `${couponName} - ${discountApplied}Rs` : "",
        udf3: "",
      }
    );

    console.log(response.data)

    if (!response || !response.data?.status) {
      return res.status(201).send({ success: false, message: response.data.msg });
    }
    
    if (response.data?.status) {
      return res.status(200).send({ success: true, data: response.data.data });
    } else {
      return res
        .status(201)
        .send({ success: false, data: "Error in initiating payment" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/check-status", generalRateLimiter, async (req, res) => {
  try {
    const { client_txn_id } = req.query;

    if(!client_txn_id){
      return res.status(400).json({ message: "transaction id not found" });
    }

    // Check if order exists
    if (await orderModel.findOne({ orderId: client_txn_id })) {
      return res.redirect("https://zelanstore.com/orders");
    }

    // Check if payment exists
    if (await paymentModel.findOne({ orderId: client_txn_id })) {
      return res.redirect("https://zelanstore.com/orders");
    }

    const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-"); // Convert "27/02/2022" to "27-02-2022"

    // Check payment status
    const paymentResponse = await axios.post("https://api.ekqr.in/api/check_order_status", {
      key: process.env.UPIGATEWAY_API_KEY,
      client_txn_id,
      txn_date: formattedDate,
    });

    // Check if the order ID is found
    if (paymentResponse.data.status) {
      const data = paymentResponse.data.data;
      const {
        amount: txn_amount,
        client_txn_id: order_id,
        customer_name,
        customer_email,
        customer_mobile,
        p_info: region,
        upi_txn_id: utr_number,
        customer_vpa,
        remark,
        udf1,
        udf2,
      } = data;

      const [userid, zoneid, productids, pname, amount, selectedPrice] = udf1.split("@");

      if (data.status === "success") {
        // Save Payment Record
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
        const priceExists = pp.cost.some((item) => {
          return (
            item.amount === amount &&
            item.id === productids &&
            (Number(item.price) === Number(selectedPrice) || Number(item.resPrice) === Number(selectedPrice))
          );
        });

        if (!priceExists) {
          return res.status(201).json({ message: "Amount does not match." });
        }

        const uid = process.env.UID;
        const email = process.env.EMAIL;
        const product = "mobilelegends";
        const time = Math.floor(Date.now() / 1000);
        const mKey = process.env.KEY;
        const productid = productids.split("&");

        const apiRequests = productid.map(async (id) => {
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
    
          const apiUrl = `https://www.smile.one/${region === "brazil" ? "br" : "ph"}/smilecoin/api/createorder`;
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
          amount,
          orderId: order_id,
          p_info: pname,
          price: txn_amount,
          customer_email,
          customer_mobile,
          playerId: userid,
          userId: userid,
          zoneId: zoneid,
          status: orderStatus,
          paymentMode: "UPI",
          ...(udf2 && { discount: udf2 }), // Add Discount Key Only If Discount Applied
        };

        // Save Order
        await new orderModel(orderData).save();

        // Send Order Email (only if successful)
        if (orderSuccess) {
          const orderDetails = { orderId: order_id, amount, price: txn_amount, pname, userid, zoneid };
          sendOrderEmail(orderDetails, customer_email);
          return res.redirect("https://zelanstore.com/user-dashboard");
        }

        console.error("Error placing order:", responses?.data?.message);
        return res.status(500).json({ error: "Error placing order" });   

      } else {
        console.error("OrderID Not Found");
        return res.status(404).json({ error: "OrderID Not Found" });
      }
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
