const express = require("express");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const superAdminAuthMiddleware = require("../middlewares/superAdminAuthMiddleware");

const {
  getAllUserController,
  getUserController,
  editUserController,
  toggleBlockUserController,
  adminGetAllOrdersController,
  adminUpdateOrderController,
  getAllQueries,
  seenQueryController,
  getAllCoupons,
  addCouponController,
  deleteCouponController,
  smileBalanceController,
  moogoldBalanceController,
  getPaymentConfigController,
  updatePaymentConfigController,
} = require("../controllers/AdminCtrl");

const router = express.Router();

router.get("/get-all-users", adminAuthMiddleware, getAllUserController);
router.get("/smile-balance", adminAuthMiddleware, smileBalanceController);
router.get("/moogold-balance", adminAuthMiddleware, moogoldBalanceController);
router.post("/get-user", adminAuthMiddleware, getUserController);
router.post("/admin-edit-user", adminAuthMiddleware, editUserController);
router.post("/toggle-block-user", adminAuthMiddleware, toggleBlockUserController);
router.get(
  "/admin-get-all-orders",
  adminAuthMiddleware,
  adminGetAllOrdersController
);
router.post("/update-order", adminAuthMiddleware, adminUpdateOrderController);
router.get("/get-all-queries", adminAuthMiddleware, getAllQueries);
router.post("/query-seen", adminAuthMiddleware, seenQueryController);
router.get("/get-coupons", getAllCoupons);
router.post("/add-coupon", adminAuthMiddleware, addCouponController);
router.post("/delete-coupon", adminAuthMiddleware, deleteCouponController);
router.get("/get-payment-config", superAdminAuthMiddleware, getPaymentConfigController);
router.post("/update-payment-config", superAdminAuthMiddleware, updatePaymentConfigController);

module.exports = router;
