const express = require("express");
const axios = require("axios");
const base64 = require("base-64");
const paymentModel = require("../models/paymentModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const authMiddleware = require("../middlewares/authMiddleware");
const walletHistoryModel = require("../models/walletHistoryModel");
const userModel = require("../models/userModel");
const generalRateLimiter = require("../middlewares/generalRateLimiter");
const couponModel = require("../models/couponModel");
const router = express.Router();

const generateBasicAuthHeader = () => {
  const credentials = `${process.env.MOOGOLD_PARTNER_ID}:${process.env.MOOGOLD_SECRET}`;
  return `Basic ${base64.encode(credentials)}`;
};

const generateAuthSignature = (payload, timestamp, path) => {
  const stringToSign = `${JSON.stringify(payload)}${timestamp}${path}`;
  return crypto
    .createHmac("sha256", process.env.MOOGOLD_SECRET)
    .update(stringToSign)
    .digest("hex");
};

// Get product
router.post("/moogold-product", async (req, res) => {
  const productID = req.body.product_id;

  if (!productID) {
    return res.status(400).send({ error: "Product ID is required" });
  }

  const payload = {
    path: "product/product_detail",
    product_id: productID,
  };

  const timestamp = Math.floor(Date.now() / 1000); // Current UNIX timestamp
  const path = "product/product_detail";
  const stringToSign = `${JSON.stringify(payload)}${timestamp}${path}`;
  const authSignature = require("crypto")
    .createHmac("sha256", process.env.MOOGOLD_SECRET)
    .update(stringToSign)
    .digest("hex");

  try {
    const response = await axios.post(
      "https://moogold.com/wp-json/v1/api/product/product_detail",
      payload,
      {
        headers: {
          Authorization: generateBasicAuthHeader(),
          auth: authSignature,
          timestamp: timestamp,
        },
      }
    );
    return res
      .status(200)
      .send({ success: true, message: "Product Fetched", data: response.data });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res
        .status(500)
        .send({ error: "An error occurred while fetching the product list" });
    }
  }
});
// Get servers
router.post("/moogold-servers", async (req, res) => {
  const productID = req.body.product_id;

  if (!productID) {
    return res.status(400).send({ error: "Product ID is required" });
  }

  const payload = {
    path: "product/server_list",
    product_id: productID,
  };

  const timestamp = Math.floor(Date.now() / 1000); // Current UNIX timestamp
  const path = "product/server_list";
  const stringToSign = `${JSON.stringify(payload)}${timestamp}${path}`;
  const authSignature = require("crypto")
    .createHmac("sha256", process.env.MOOGOLD_SECRET)
    .update(stringToSign)
    .digest("hex");

  try {
    const response = await axios.post(
      "https://moogold.com/wp-json/v1/api/product/server_list",
      payload,
      {
        headers: {
          Authorization: generateBasicAuthHeader(),
          auth: authSignature,
          timestamp: timestamp,
        },
      }
    );
    return res
      .status(200)
      .send({ success: true, message: "Product Fetched", data: response.data });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res
        .status(500)
        .send({ error: "An error occurred while fetching the product list" });
    }
  }
});


// UPI_GATEWAY
router.post("/create-order", generalRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { order_id, txn_note, gameId, customer_name, customer_email, customer_mobile, couponId } = req.body;

    if (!order_id || !txn_note || !gameId || !customer_name || !customer_email || !customer_mobile) {
      return res.status(201).send({ success: false, message: "Invalid Details" });
    }

    // Fix very short customer name (less than 3 letters)
    let finalCustomerName = customer_name;
    if (!customer_name || customer_name.trim().length < 3) {
      finalCustomerName = `${customer_name}_ZelanStore`;
    }

    
    const [userId, zoneId, productId, pname, amount, selectedPrice] = txn_note.split("@");

    if (!userId || !zoneId || !productId || !pname || !amount || !selectedPrice) {
      return res.status(201).send({ success: false, message: "Invalid txn_note format" });
    }

    if (Number(selectedPrice) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price, cannot proceed with zero or negative amount." });
    }


    // Check if order already exists
    if (await orderModel.findOne({ orderId: order_id })) {
      return res.status(201).send({ success: false, message: "Order already exists" });
    }

    // Validate User
    const user = await userModel.findOne({ email: customer_email });
    if (!user) {
      return res.status(201).json({ success: false, message: "Invalid User Details" });
    }

    // Validate Product
    const checkProduct = await productModel.findOne({ name: pname });
    if (!checkProduct) {
      return res.status(201).json({ message: "Invalid Product Details" });
    }

    //CROSS CHECK PACKAGE PRICE AND GAME ID
    const priceExists = checkProduct.cost.some((item) => {
      return (
        item.amount === amount &&
        item.id === productId &&
        (Number(item.price) === Number(selectedPrice) || Number(item.resPrice) === Number(selectedPrice))
      );
    });

    if (!priceExists) {
      return res.status(201).json({ message: "Amount does not match." });
    }

    let finalPrice = Number(selectedPrice);
    
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

    const redirectUrl = `https://zelanstore.com/api/moogold/check-status`;
    // const redirectUrl = `http://localhost:8080/api/smile/check-status`;
    console.log(finalPrice)
    const response = await axios.post(
      "https://api.ekqr.in/api/create_order",
      {
        key: process.env.UPIGATEWAY_API_KEY,
        client_txn_id: order_id.toString(),
        amount: finalPrice.toString(),
        p_info : gameId,
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
        .send({ success: false, message: "Error in initiating payment" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
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
    // Check if payment history exists

    if (await paymentModel.findOne({orderId: client_txn_id})) {
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
        p_info: gameName,
        upi_txn_id: utr_number,
        customer_vpa,
        remark,
        udf1,
        udf2,
      } = data;

      const [userid, zoneid, productId, pname, amount, selectedPrice] = udf1.split("@");

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
            item.id === productId &&
            (Number(item.price) === Number(selectedPrice) || Number(item.resPrice) === Number(selectedPrice))
          );
        });

        if (!priceExists) {
          return res.status(201).json({ message: "Amount does not match." });
        }

        //? GETTING FIELDS
        const fieldsPayload = {
          path: "product/product_detail",
          product_id: gameName,
        };

        const timestampp = Math.floor(Date.now() / 1000);
        const pathh = "product/product_detail";
        const authSignaturee = generateAuthSignature(
          fieldsPayload,
          timestampp,
          pathh
        );

        const moogold = await axios.post(
          "https://moogold.com/wp-json/v1/api/product/product_detail",
          fieldsPayload,
          {
            headers: {
              Authorization: generateBasicAuthHeader(),
              auth: authSignaturee,
              timestamp: timestampp,
            },
          }
        );

        if (moogold.data.err_code) {
          const order = new orderModel({
            api: "yes",
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
            paymentMode: "wallet",
            ...(udf2 && { discount: udf2 }),
          });
          await order.save();
          return res.status(201).send({ success: false, message: "Contact to Admin" });
        }

        //? GETTING FIELDS END

        //! CREATE ORDER MOOGOLD
        const payload = {
          path: "order/create_order",
          data: {
            category: 1,
            "product-id": productId,
            quantity: 1,
          },
        };

        moogold.data.fields.forEach((field, index) => {
          if (index === 0) {
            payload.data[field] = userid;
          } else if (index === 1) {
            payload.data[field] = zoneid;
          }
        });

        const timestamp = Math.floor(Date.now() / 1000);
        const path = "order/create_order";
        const authSignature = generateAuthSignature(payload, timestamp, path);

        console.log("Sending order creation request to Moogold...");

        const response = await axios.post(
          "https://moogold.com/wp-json/v1/api/order/create_order",
          payload,
          {
            headers: {
              Authorization: generateBasicAuthHeader(),
              auth: authSignature,
              timestamp: timestamp,
            },
          }
        );
       
        console.log(response.data);

        if (response.data.err_code) {
          const order = new orderModel({
            api: "yes",
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
            paymentMode: "wallet",
            ...(udf2 && { discount: udf2 }),
          });
          await order.save();
          return res.status(201).send({ success: false, message: "Order Failed" });
        }

        console.log(response.data.order_id);


        if (response.status) {
          const order = new orderModel({
            api: "yes",
            amount: amount,
            orderId: order_id,
            p_info: pname,
            price: txn_amount,
            customer_email,
            customer_mobile,
            playerId: userid,
            userId: userid,
            zoneId: zoneid,
            status: "success",
            paymentMode: "wallet",
            ...(udf2 && { discount: udf2 }),
          });
          await order.save();
        }

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
        return res.redirect("https://zelanstore.com/user-dashboard");
      } else {
        console.error("OrderID Not Found");
        return res.status(404).json({ error: "OrderID Not Found" });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// wallet
router.post("/wallet", authMiddleware, async (req, res) => {
  try {
    const { 
      api, orderId, userid, zoneid, productid, pname, amount, gameName, 
      customer_name, customer_mobile, price, couponId 
    } = req.body;
    
    if (!api || !orderId || !userid || !productid || !pname || !amount || 
        !gameName || !customer_name || !customer_mobile || !price) {
      return res.status(400).send({ success: false, message: "Invalid Details" });
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

    //? GETTING FIELDS
    const fieldsPayload = {
      path: "product/product_detail",
      product_id: gameName,
    };

    const timestampp = Math.floor(Date.now() / 1000);
    const pathh = "product/product_detail";
    const authSignaturee = generateAuthSignature(
      fieldsPayload,
      timestampp,
      pathh
    );

    const moogold = await axios.post(
      "https://moogold.com/wp-json/v1/api/product/product_detail",
      fieldsPayload,
      {
        headers: {
          Authorization: generateBasicAuthHeader(),
          auth: authSignaturee,
          timestamp: timestampp,
        },
      }
    );

    if (moogold.data.err_code) {
      const order = new orderModel({
        api: api,
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
        ...(discountApplied > 0 ? { discount: `${couponName} - ${discountApplied}Rs` } : {}),
      });
      await order.save();
      return res.status(201).send({ success: false, message: "Contact to Admin" });
    }

    //? GETTING FIELDS END

    //! CREATE ORDER MOOGOLD
    const payload = {
      path: "order/create_order",
      data: {
        category: 1,
        "product-id": productid,
        quantity: 1,
      },
    };

    moogold.data.fields.forEach((field, index) => {
      if (index === 0) {
        payload.data[field] = userid;
      } else if (index === 1) {
        payload.data[field] = zoneid;
      }
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const path = "order/create_order";
    const authSignature = generateAuthSignature(payload, timestamp, path);

    console.log("Sending order creation request to Moogold...");

    const response = await axios.post(
      "https://moogold.com/wp-json/v1/api/order/create_order",
      payload,
      {
        headers: {
          Authorization: generateBasicAuthHeader(),
          auth: authSignature,
          timestamp: timestamp,
        },
      }
    );
    
    console.log(response.data);

    if (response.data.err_code) {
      const order = new orderModel({
        api: api,
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
        ...(discountApplied > 0 ? { discount: `${couponName} - ${discountApplied}Rs` } : {}),
      });
      await order.save();
      return res.status(201).send({ success: false, message: "Order Failed" });
    }

    console.log(response.data.order_id);

  
    if (response.status) {
      const order = new orderModel({
        api: api,
        amount: amount,
        orderId: orderId,
        p_info: pname,
        price: finalPrice,
        customer_email,
        customer_mobile,
        playerId: userid,
        userId: userid,
        zoneId: zoneid,
        status: "success",
        paymentMode: "wallet",
        ...(discountApplied > 0 ? { discount: `${couponName} - ${discountApplied}Rs` } : {}),
      });
      await order.save();

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
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.MAIL, pass: process.env.APP_PASSWORD },
        });
        let mailDetails = { from: process.env.MAIL, to: `${customer_email}`, subject: "Order Successful!", html: htmlContent };
        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log(err);
          }
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }

      return res.status(200).send({ success: true, message: "Order Placed Successfully" });
    }
  return res.status(201).send({ success: false, message: "Error in placing order" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
