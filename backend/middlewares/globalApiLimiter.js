const rateLimit = require("express-rate-limit");

// Global API limiter: 300 requests per 1 minute window per IP
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please wait a minute and try again.",
  },
});

module.exports = globalApiLimiter;
