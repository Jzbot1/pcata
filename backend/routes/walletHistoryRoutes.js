const express = require("express");
const {
  addWalletHistoryController,
  getWalletHistoryController,
  adminWalletHistoryController,
} = require("../controllers/walletHistoryCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

const router = express.Router();

// routes
router.post("/add-wallet-history", authMiddleware, addWalletHistoryController);
router.post("/get-wallet-history", authMiddleware, getWalletHistoryController);
router.post("/gethistories", adminAuthMiddleware, adminWalletHistoryController);

module.exports = router;

