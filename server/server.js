const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db.js");

// Routes
const adminRouter = require("./routes/adminRoutes.js");
const authRouter = require("./routes/authRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const couponRouter = require("./routes/couponRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const feedbackRouter = require("./routes/feedbackRoutes.js");
const cartRouter = require("./routes/cartRoutes.js");
const wishlistRouter = require("./routes/wishlistRoutes.js");
const sectionRouter = require("./routes/sectionRoutes.js");
const sitePageRouter = require("./routes/sitePageRoutes.js");

const REQUIRED_ENV_KEYS = ["MONGO_URI", "JWT_SECRET"];
const missingEnvKeys = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

if (missingEnvKeys.length) {
  throw new Error(`Missing required environment variables: ${missingEnvKeys.join(", ")}`);
}

const app = express();
const isProduction = process.env.NODE_ENV === "production";

connectDB();

app.disable("x-powered-by");

if (isProduction) {
  app.set("trust proxy", 1);
}

const parseConfiguredOrigins = (...values) =>
  values
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((origin) => origin.trim())
    .filter(Boolean);

const parseAllowedOrigins = () =>
  parseConfiguredOrigins(
    process.env.ALLOWED_ORIGINS,
    process.env.FRONTEND_URL
  );

const allowedOrigins = new Set([
  ...parseAllowedOrigins(),
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

const isAllowedDevOrigin = (origin) => {
  if (!origin) return false;

  try {
    const { hostname, protocol } = new URL(origin);
    const isHttp = protocol === "http:" || protocol === "https:";
    const isLocalNetwork =
      /^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(
        hostname
      );

    return isHttp && isLocalNetwork;
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isAllowedDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 600 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 25 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(cookieParser());
app.use(globalLimiter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/admin", authLimiter, adminRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/order", orderRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/sections", sectionRouter);
app.use("/api/site-pages", sitePageRouter);

app.get("/", (_req, res) => res.json({ message: "PrintedTees API Running" }));

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;

  if (!isProduction) {
    console.error(err);
  }

  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`)
);

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close(false);
      console.log("HTTP server closed and MongoDB connection released.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    shutdown(signal);
  });
});
