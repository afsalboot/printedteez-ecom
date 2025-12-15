const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");

//Routes Import
const adminRouter = require("./routes/adminRoutes.js");
const authRouter = require("./routes/authRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const couponRouter = require("./routes/couponRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const feedbackRouter = require("./routes/feedbackRoutes.js");
const cartRouter = require("./routes/cartRoutes.js");
const wishlistRouter = require("./routes/wishlistRoutes.js");
const sectionRouter = require("./routes/sectionRoutes.js")

//DB config
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(cookieParser());

//Routes
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/order", orderRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/sections", sectionRouter);

app.get("/", (req, res) => res.json({ message: "PrintedTees API Running" }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
