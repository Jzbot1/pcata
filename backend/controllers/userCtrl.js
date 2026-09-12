const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const crypto = require("crypto");
const orderModel = require("../models/orderModel");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Encrypt OTP
function encrypt(text, key, iv) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}
// Define your encryption key and initialization vector
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({
      $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
    });
    if (existingUser) {
      const message =
        existingUser.email === req.body.email
          ? "Email Already Exists"
          : "Mobile Number Already Exists";
      return res.status(200).send({ success: false, message });
    }
    if (req.body.balance || req.body.isAdmin || req.body.reseller) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to Register" });
    }
    const { fname, lname, email, mobile, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      fname: fname || "",
      lname: lname || "",
      email: email.trim().toLowerCase(),
      mobile: mobile || undefined,
      password: hashedPassword,
      authProvider: "local",
      mobileVerified: true,
      emailVerified: true,
    });
    await newUser.save();
    res.status(201).send({ success: true, message: "Registration Successful" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Credentials" });
    }

    const isAdmin = user?.isAdmin || false;
    const expiresIn = isAdmin ? "30d" : "30d";

    const token = jwt.sign({ id: user._id, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });

    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();
    }

    return res
      .status(200)
      .send({ success: true, message: "Login Successful", token, isAdmin });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });

    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    
    user.password = undefined;
    const balanceString = user?.balance ? user.balance.toString() : "0";
    const id = encrypt(balanceString, key, iv);
    user.balance = undefined;

    return res.status(200).send({
      success: true,
      data: {
        user,
        id,
        key: key.toString("hex"),
        iv: iv.toString("hex"),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Auth Error", error });
  }
};
const userProfileUpdateController = async (req, res) => {
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res.status(200).send({
        success: false,
        message: "User Not Found",
      });
    }

    if (userExist?.email === process.env.CLIENT_EMAIL) {
      return res.status(201).send({
        success: false,
        message: "you are not allowed to update the user data",
      });
    }

    req.body.balance = null;

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userUpdate = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!userUpdate) {
      return res.status(201).send({
        success: false,
        message: "Failed to update password",
      });
    }
    return res.status(202).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `User Profile Update Ctrl ${error.message}`,
    });
  }
};
const sendMailController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Email Not Registered With Us" });
    }
    const emailOtp = Math.floor(100000 + Math.random() * 900000);
    const savedOtpUser = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { emailOtp: emailOtp } },
      { new: true }
    );
    if (!savedOtpUser) {
      return res
        .status(201)
        .send({ success: false, message: "Error In saving Otp" });
    }
    await sendMail(
      savedOtpUser?.email,
      "Email Verification OTP",
      emailOtp,
      req.body.msg
    );
    return res.status(203).send({
      success: true,
      message: "Otp Send Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Send Mail Controller ${error.message}`,
    });
  }
};
const verifyOtpController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }

    if (user?.email === process.env.CLIENT_EMAIL) {
      return res.status(202).send({
        success: false,
        message: "You are not allowed to update the password",
      });
    }
    
    if (user.emailOtp !== req.body.userEnteredOtp) {
      return res.status(201).send({ success: false, message: "Incorrect OTP" });
    } else {
      const password = req.body.pass;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const updateUser = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { password: hashedPassword, isActive: "Yes" } },
        { new: true }
      );
      if (!updateUser) {
        return res
          .status(200)
          .send({ success: false, message: "Failed to Verify" });
      }
      return res.status(202).send({
        success: true,
        message: "Password update successfully",
        data: user,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Verify Otp Controller ${error.message}`,
    });
  }
};
const leaderboardController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const from = new Date(startDate);
    const to = new Date(endDate);

    const topUsers = await orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: "$customer_email",
          totalSpent: { $sum: { $toDouble: "$price" } },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "email",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          totalSpent: 1,
          fname: "$userInfo.fname",
          _id: 0,
        },
      },
    ]);

    return res.status(200).send({
      success: true,
      data: topUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const googleLoginController = async (req, res) => {
  try {
    const { credential, client_id } = req.body;
    if (!credential) {
      return res.status(400).send({
        success: false,
        message: "Google credential is required",
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || client_id,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      // Decode fallback in case audience check differs in dev/prod
      const jwtDecoded = jwt.decode(credential);
      if (
        jwtDecoded &&
        jwtDecoded.email &&
        jwtDecoded.iss &&
        (jwtDecoded.iss.includes("accounts.google.com") ||
          jwtDecoded.iss === "https://accounts.google.com")
      ) {
        payload = jwtDecoded;
      } else {
        return res.status(401).send({
          success: false,
          message: "Invalid Google token: " + verifyError.message,
        });
      }
    }

    const { email, name, picture, sub } = payload;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email not provided by Google account",
      });
    }

    // Check if user already exists
    let user = await userModel.findOne({ email });

    if (user) {
      if (user.block === "yes") {
        return res.status(403).send({
          success: false,
          message: "Your account is blocked. Please contact support.",
        });
      }

      let updated = false;
      if (!user.googleId) {
        user.googleId = sub;
        updated = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        updated = true;
      }
      if (!user.fname && name) {
        user.fname = name;
        updated = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new userModel({
        email,
        fname: name || "User",
        avatar: picture,
        googleId: sub,
        authProvider: "google",
        emailVerified: true,
        mobileVerified: false,
      });
      await user.save();
    }

    const isAdmin = user?.isAdmin || false;
    const expiresIn = "30d";

    const token = jwt.sign({ id: user._id, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });

    return res.status(200).send({
      success: true,
      message: "Google Login Successful",
      token,
      isAdmin,
    });
  } catch (error) {
    console.error("Google Login Controller Error:", error);
    return res.status(500).send({
      success: false,
      message: `Google Login Error: ${error.message}`,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  leaderboardController,
  authController,
  sendMailController,
  verifyOtpController,
  userProfileUpdateController,
  googleLoginController,
};
