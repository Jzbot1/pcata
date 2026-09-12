const express = require("express");
const {
  loginController,
  registerController,
  authController,
  sendMailController,
  verifyOtpController,
  userProfileUpdateController,
  leaderboardController,
  sendMobileOtpController,
  googleLoginController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const generalRateLimiter = require("../middlewares/generalRateLimiter");

// router object
const router = express.Router();
// routes
router.post("/login", generalRateLimiter, loginController);
router.get("/auth-config", (req, res) => {
  res.status(200).json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  });
});
router.post("/google-login", generalRateLimiter, googleLoginController);
router.post("/register", generalRateLimiter, registerController);
router.post(
  "/user-profile-update",
  generalRateLimiter,
  authMiddleware,
  userProfileUpdateController
);
router.post("/getUserData", authMiddleware, authController);
router.get("/leaderboard", leaderboardController);

router.post("/send-otp", generalRateLimiter, sendMailController);
router.post("/verify-otp", generalRateLimiter, verifyOtpController);
module.exports = router;
