const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const paymentModel = require("../models/paymentModel");
const bcrypt = require("bcryptjs");
const couponModel = require("../models/couponModel");
const md5 = require("md5");
const querystring = require("querystring");
const axios = require("axios");
const crypto = require("crypto");
const contactModel = require("../models/contactModel");
const paymentConfigModel = require("../models/paymentConfigModel");

const getAllUserController = async (req, res) => {
  try {
    const allUser = await userModel.find({
      email: {
        $nin: ["mszapachuau@gmail.com", "aashirdigital@gmail.com"],
      },
    });
    if (!allUser) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "All Users Fetched Sucesss",
      data: allUser,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get All User Ctrl ${error.message}` });
  }
};

const getUserController = async (req, res) => {
  try {

    const user = await userModel.findById(req.body.id);

    if (!user) {
      return res.status(404).send({
        success:false,
        message:"User not found"
      })
    }

    return res.status(200).send({
      success:true,
      data:user
    })

  } catch (error) {

    res.status(500).send({
      success:false,
      message:error.message
    })

  }
}

const editUserController = async (req, res) => {
  try {
    const { _id, fname, email, mobile, password, balanceChange, reseller } =
      req.body;

    if (!_id) {
      return res.status(400).send({
        success: false,
        message: "User ID required",
      });
    }

    const user = await userModel.findById(_id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // EMAIL DUPLICATE CHECK
    if (email && email !== user.email) {
      const emailExists = await userModel.findOne({ email });
      if (emailExists) {
        return res.send({
          success: false,
          message: "Email already used by another user",
        });
      }
    }

    // MOBILE DUPLICATE CHECK
    if (mobile && mobile !== user.mobile) {
      const mobileExists = await userModel.findOne({ mobile });
      if (mobileExists) {
        return res.send({
          success: false,
          message: "Mobile already used by another user",
        });
      }
    }

    let newBalance = user.balance;

    // BALANCE ADD / DEDUCT
    if (balanceChange) {
      newBalance = Number(user.balance) + Number(balanceChange);
    }

    // PASSWORD HASH
    let hashedPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      {
        fname,
        email,
        mobile,
        password: hashedPassword,
        balance: newBalance,
        reseller,
      },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Edit User API",
    });
  }
};


const adminGetAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    if (!orders || orders.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Orders Found" });
    }

    const totalAmount = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$price" } },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
        },
      },
    ]);
    return res.status(201).send({
      success: true,
      message: "All Orders Fetched Success",
      data: orders,
      total: totalAmount.length > 0 ? totalAmount[0].total : 0,
    });
  } catch (error) {
    console.error("Error in adminGetAllOrdersController:", error);
    res.status(500).send({
      success: false,
      message: `Admin Get All Order Ctrl ${error.message}`,
    });
  }
};

const adminUpdateOrderController = async (req, res) => {
  try {
    const order = await orderModel.findOne({
      orderId: req.body.orderId,
    });
    if (!order) {
      return res
        .status(200)
        .send({ success: false, message: "No Order Found" });
    }
    const updateOrder = await orderModel.findOneAndUpdate(
      {
        orderId: req.body.orderId,
      },
      { $set: { status: req.body.status } },
      { new: true }
    );
    if (!updateOrder) {
      return res.status(201).send({
        success: false,
        message: "Failed to update the order",
      });
    }
    return res.status(202).send({
      success: true,
      message: "Order updated successfullt",
      data: updateOrder,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Admin Get All Order Ctrl ${error.message}`,
    });
  }
};

const getAllQueries = async (req, res) => {
  try {
    const queries = await contactModel.find({});
    if (queries.length === 0) {
      return res.status(200).send({
        success: false,
        message: "No Queries Found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Queries fetched success",
      data: queries,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get All Queries Ctrl ${error.message}`,
    });
  }
};

const seenQueryController = async (req, res) => {
  try {
    const queries = await contactModel.findOne({ _id: req.body.id });
    if (!queries) {
      return res.status(200).send({
        success: false,
        message: "No Queries Found",
      });
    }
    const updateQuery = await contactModel.findOneAndUpdate(
      {
        _id: req.body.id,
      },
      { $set: { status: "seen" } },
      { new: true }
    );
    return res.status(201).send({
      success: true,
      message: "Query updated success",
      data: updateQuery,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get All Queries Ctrl ${error.message}`,
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({});
    if (coupons.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Coupons Found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Coupons Fetched Success",
      data: coupons,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const addCouponController = async (req, res) => {
  try {
    const { name, discount } = req.body;
    const existingCoupon = await couponModel.findOne({ name: req.body.name });
    if (existingCoupon) {
      return res.status(201).send({
        success: false,
        message: "Coupon with this name already exists",
      });
    }
    const coupon = new couponModel(req.body);
    await coupon.save();
    return res.status(200).send({
      success: true,
      message: "Coupon Added Successfully",
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const deleteCouponController = async (req, res) => {
  try {
    const { id } = req.body;

    const existingCoupon = await couponModel.findOne({ _id: id });
    if (!existingCoupon) {
      return res.status(201).send({
        success: false,
        message: "Coupon not found",
      });
    }

    const result = await couponModel.findOneAndDelete({ _id: id });
    if (!result) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to delete" });
    }
    return res
      .status(200)
      .send({ success: true, message: "Coupon deleted Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Delete Coupon Ctrl ${error.message}`,
    });
  }
};

// smile
const smileBalanceController = async (req, res) => {
  try {
    const uid = process.env.UID;
    const email = process.env.EMAIL;
    const product = "mobilelegends";
    const time = Math.floor(Date.now() / 1000);
    const mKey = process.env.KEY;

    const signArr = {
      uid,
      email,
      product,
      time,
    };

    const sortedSignArr = Object.fromEntries(Object.entries(signArr).sort());
    const str =
      Object.keys(sortedSignArr)
        .map((key) => `${key}=${sortedSignArr[key]}`)
        .join("&") +
      "&" +
      mKey;
    const sign = md5(md5(str));
    const formData = querystring.stringify({
      uid,
      email,
      product,
      time,
      sign,
    });
    let apiUrl = "https://www.smile.one/br/smilecoin/api/querypoints";
    const response = await axios.post(apiUrl, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    return res
      .status(200)
      .send({ success: true, data: response.data.smile_points });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getPaymentConfigController = async (req, res) => {
  try {
    let config = await paymentConfigModel.findOne({
      $or: [{ gatewayName: "ACTIVE_GATEWAY" }, { gatewayName: "UPIGATEWAY" }],
    });

    if (!config) {
      config = {
        gatewayName: "ACTIVE_GATEWAY",
        gatewayType: "JZSTORE",
        apiUrl: "https://checkout.pages.jzstore.in",
        apiKey: "509ffd178aff24dc09640796da90fc22",
        isActive: true,
      };
    }
    return res.status(200).send({
      success: true,
      message: "Payment configuration fetched successfully",
      data: config,
    });
  } catch (error) {
    console.error("Get payment config error:", error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

const updatePaymentConfigController = async (req, res) => {
  try {
    const { gatewayType, apiUrl, apiKey, isActive } = req.body;

    if (!apiUrl || !apiKey) {
      return res.status(400).send({
        success: false,
        message: "API URL and API Key / Token are required",
      });
    }

    const trimmedUrl = apiUrl.trim().replace(/\/+$/, "");
    if (!trimmedUrl.startsWith("https://")) {
      return res.status(400).send({
        success: false,
        message: "API URL must start with https:// for security",
      });
    }

    const resolvedType =
      gatewayType ||
      (trimmedUrl.includes("jzstore") ? "JZSTORE" : "UPIGATEWAY");

    const updatedConfig = await paymentConfigModel.findOneAndUpdate(
      {
        $or: [{ gatewayName: "ACTIVE_GATEWAY" }, { gatewayName: "UPIGATEWAY" }],
      },
      {
        $set: {
          gatewayName: "ACTIVE_GATEWAY",
          gatewayType: resolvedType,
          apiUrl: trimmedUrl,
          apiKey: apiKey.trim(),
          isActive: typeof isActive === "boolean" ? isActive : true,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Payment Gateway configuration updated successfully",
      data: updatedConfig,
    });
  } catch (error) {
    console.error("Update payment config error:", error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

const moogoldBalanceController = async (req, res) => {
  try {
    const partnerId = process.env.MOOGOLD_PARTNER_ID;
    const secret = process.env.MOOGOLD_SECRET;

    if (!partnerId || !secret) {
      return res.status(200).send({
        success: false,
        message: "MooGold credentials missing in .env",
        data: "0.00",
      });
    }

    const credentials = `${partnerId}:${secret}`;
    const basicAuth = `Basic ${Buffer.from(credentials).toString("base64")}`;

    const payload = { path: "user/balance" };
    const timestamp = Math.floor(Date.now() / 1000);
    const path = "user/balance";
    const stringToSign = `${JSON.stringify(payload)}${timestamp}${path}`;
    const authSignature = crypto
      .createHmac("sha256", secret)
      .update(stringToSign)
      .digest("hex");

    const response = await axios.post(
      "https://moogold.com/wp-json/v1/api/user/balance",
      payload,
      {
        headers: {
          Authorization: basicAuth,
          auth: authSignature,
          timestamp: timestamp,
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      }
    );

    const balanceData = response.data;
    const balance =
      balanceData.balance !== undefined
        ? balanceData.balance
        : balanceData.data?.balance || "0.00";
    const currency = balanceData.currency || "USD";

    return res.status(200).send({
      success: true,
      data: balance,
      currency,
      message: "MooGold balance fetched successfully",
    });
  } catch (error) {
    console.error(
      "MooGold Balance Error:",
      error.response ? error.response.data : error.message
    );
    return res.status(200).send({
      success: false,
      data: "0.00",
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch MooGold balance",
    });
  }
};

module.exports = {
  getAllUserController,
  getUserController,
  editUserController,
  adminGetAllOrdersController,
  adminUpdateOrderController,
  addCouponController,
  deleteCouponController,
  getAllQueries,
  seenQueryController,
  getAllCoupons,
  smileBalanceController,
  moogoldBalanceController,
  getPaymentConfigController,
  updatePaymentConfigController,
};
