const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // ✅ Step 1: Check if header is missing or malformed
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid format",
      });
    }

    const token = req.headers["authorization"].split(" ")[1];

    // ✅ Step 2: Handle "Bearer null"
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or empty",
      });
    }

    // ✅ Step 3: Verify token
    JWT.verify(token, process.env.JWT_SECRET, async  (err, decoded) => {
      if (err) {
        const isExpired = err.name === "TokenExpiredError";
        return res.status(401).json({
          success: false,
          message: isExpired ? "Token expired" : "Token verification failed",
        });
      }

      const userId = decoded.id;
      // Attach userId to request
      req.body.userId = decoded.id;

      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // 🛡️ Secure the email: override any frontend-sent value
      delete req.body.email;
      delete req.body.customer_email;
      
      // ✅ Attach user to request (optional)
      req.body.email = user.email;
      req.body.customer_email = user.email;

      next();
    });
  } catch (error) {
    console.error("JWT Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in auth middleware",
    });
  }
};
