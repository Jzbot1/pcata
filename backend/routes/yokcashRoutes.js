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

    const redirectUrl = `https://zelanstore.com/api/yok/check-status`;
    // const redirectUrl = `http://localhost:8080/api/smile/check-status`;
    
    const response = await axios.post(
      "https://api.ekqr.in/api/create_order",
      {
        key: process.env.UPIGATEWAY_API_KEY,
        client_txn_id: order_id.toString(),
        amount: finalPrice.toString(),
        p_info : pname,
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

// EX GATEWAY CHECK STATUS
router.get("/check-status", async (req, res) => {
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

    const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-");
    
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
        p_info: product_name,
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

        const API_KEY = process.env.YOKCASH_API;
        const url = "https://api.yokcash.com/order";
        const productid = productids.split("&");

        let response;

        for (let i = 0; i < productid.length; i++) {
          const uniqueOrderId = `${order_id}-${i}`;

          const resp = await axios.post(
            url,
            {
              api_key: API_KEY,
              service_id: productid[i],
              target: zoneid !== "none" ? `${userid}|${zoneid}` : userid,
              kontak: customer_mobile,
              idtrx: uniqueOrderId,
              callback: "https://yourwebsite.com/callback/yokcash" // Optional
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          response = resp.data;
        }

        if (!response.status) {
          const orderData = {
            api: "yes",
            apiName: "yokcash",
            amount: amount,
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

          console.error("Error placing order:", response.data.msg);

          return res.status(500).send(`
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

        const order = new orderModel({
          api: "yes",
          apiName: "yokcash",
          amount: amount, 
          orderId: order_id,
          p_info: pname,
          price: txn_amount,
          status: yokcashStatus || "pending",
          yid: response.data.id,
          customer_email,
          customer_mobile,
          playerId: userid,
          userId: userid,
          zoneId: zoneid,
          paymentMode: "UPI",
          ...(udf2 && { discount: udf2 }), 
        }).save();

        // Send Order Email
        if (yokcashStatus) {
          const orderDetails = { orderId: order_id, amount, price: txn_amount, pname, userid, zoneid };
          sendOrderEmail(orderDetails, customer_email);
          return res.redirect("https://zelanstore.com/user-dashboard");
        }
        
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
