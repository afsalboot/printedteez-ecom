const express = require("express");
const { createAdmin, loginAdmin } = require("../controllers/adminController.js");
const router = express.Router();


router.post("/create-admin", createAdmin);
router.post("/admin-login", loginAdmin);




module.exports = router;
