const systemConfigModel = require("../models/systemConfigModel");
const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");

let cachedMaintenance = null;
let lastFetchTime = 0;

const checkMaintenance = async () => {
  const now = Date.now();
  if (cachedMaintenance !== null && now - lastFetchTime < 5000) {
    return cachedMaintenance;
  }
  try {
    const config = await systemConfigModel.findOne();
    cachedMaintenance = Boolean(config?.isMaintenance);
    lastFetchTime = now;
    return cachedMaintenance;
  } catch (err) {
    return false;
  }
};

const maintenanceMiddleware = async (req, res, next) => {
  const isMaintenance = await checkMaintenance();
  if (!isMaintenance) {
    return next();
  }

  // Check if requester is an authenticated Admin
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        const user = await userModel.findById(decoded.id);
        if (user && (user.isAdmin || user.email === process.env.SUPER_ADMIN_EMAIL)) {
          return next();
        }
      }
    } catch (_) {}
  }

  return res.status(503).json({
    success: false,
    maintenance: true,
    message: "Store is temporarily under scheduled maintenance. Please try again shortly.",
  });
};

module.exports = maintenanceMiddleware;
