const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
} = require("../controllers/authController.js");

router.post("/signup", registerUser);
router.post("/login", loginUser);

//Email verification and notification for signup
router.get("/verify-email", verifyEmail);

module.exports = router;