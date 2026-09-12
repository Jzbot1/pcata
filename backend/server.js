// Node.js 22+ compatibility polyfill for legacy dependencies (jwa/buffer-equal-constant-time)
const bufferModule = require("buffer");
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

const express = require("express");
const path = require("path");
const fs = require("fs");
const colors = require("colors");
const morgan = require("morgan"); // corrected spelling
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");
const session = require("express-session");

require("./cron/yokcashStatusChecker.js");

// dotenv
dotenv.config({ path: path.join(__dirname, ".env") });
//mongodb connection
connectDB();
// rest object
const app = express();

// Security Headers
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Allows React assets & Google OAuth scripts smoothly
  })
);

const allowedOrigins = [
  "https://zelanstore.com",
  "https://www.zelanstore.com",
  "https://pgateway.in",
  "http://localhost:3000",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost:")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ZelanStoreSessionSec_938@!_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_MODE === "production",
    },
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("build"));

// Middleware to check referer
function checkReferer(req, res, next) {
  const referer = req.headers.referer;
  const allowedDomains = [
    "https://zelanstore.com",
    "https://zelanstore.com/",
    "https://www.zelanstore.com",
    "https://www.zelanstore.com/",
    "https://pgateway.in",
    "http://localhost:3000",
    "http://localhost:8080",
  ];
  if (referer && allowedDomains.some((domain) => referer.startsWith(domain))) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
}
// app.use("/api", checkReferer);

// Static file for images
app.use(
  "/productImages",
  express.static(path.join(__dirname, "productImages"))
);
app.set('trust proxy', 1);
app.use("/admin-products", express.static("productImages"));
app.use("/admin-edit-product/:id", express.static("productImages"));
app.use("/admin-view-order/:id", express.static("productImages"));
app.use("/product/", express.static("productImages"));
app.use("/product/:name", express.static("productImages"));
//! GALLERY
app.use("/gallery", express.static(path.join(__dirname, "gallery")));
app.use("/gallery", express.static("gallery"));
app.use("/product/:name", express.static("gallery"));
//! NOTIFICATION
app.use(
  "/notificationImages",
  express.static(path.join(__dirname, "notificationImages"))
);
//! BANNER
app.use("/banners", express.static(path.join(__dirname, "banners")));
app.use("/admin-banners", express.static("banners"));
//! PROMO
app.use("/promoImg", express.static(path.join(__dirname, "promoImg")));
app.use("/admin-promo", express.static("promoImg"));
app.use("/promo/:id", express.static("promoImg"));

// routes
app.use("/api/user/", require("./routes/userRoutes"));
app.use("/api/contact/", require("./routes/contactRoutes"));
app.use("/api/admin/", require("./routes/adminRoutes"));
app.use("/api/product/", require("./routes/productRoutes"));
app.use("/api/order/", require("./routes/orderRoutes"));
app.use("/api/image/", require("./routes/imageRoutes"));
app.use("/api/payment/", require("./routes/paymentRoutes"));
app.use("/api/banner/", require("./routes/bannerRoutes"));
// order end points
app.use("/api/smile/", require("./routes/smileRoutes"));
app.use("/api/moogold/", require("./routes/moogoldRoutes"));
app.use("/api/wallet/", require("./routes/walletRoutes"));
app.use("/api/yok/", require("./routes/yokcashRoutes"));
app.use("/api/manual/", require("./routes/manualRoutes"));
app.use("/api/wallet/", require("./routes/walletHistoryRoutes"));
app.use("/api/categories/", require("./routes/categoryRoutes"));
app.use("/api/leaderboard/", require("./routes/leaderboardRoutes"));

// PORT
const port = process.env.PORT || 8080;

// STATIC FILES RUNNING ON BUILD FOLDER
if (process.env.NODE_MODE === "production") {
  const buildPath = [
    path.join(__dirname, "../client/build"),
    path.join(__dirname, "./client/build"),
    path.join(__dirname, "build"),
  ].find((p) => fs.existsSync(p));

  if (buildPath) {
    app.use(express.static(buildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.send("API running in production mode (Client build folder not found).");
    });
  }
} else {
  app.get("/", (req, res) => {
    res.send("API running in development mode...");
  });
}

// Listen
app.listen(port, (req, res) => {
  console.log(
    `Server running in ${process.env.NODE_MODE} Mode on Port ${process.env.PORT}`
      .bgCyan
  );
});
