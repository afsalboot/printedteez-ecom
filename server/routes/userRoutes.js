const express = require("express");
const protected = require("../middlewares/authMiddleware.js");
const { getProfileById, updateUserProfile, changePassword, deleteMyAccount, getAllProfiles, deleteUser, requestPasswordReset, resetPassword } = require("../controllers/userController.js");
const upload = require("../middlewares/upload.js");
const isAdmin = require("../middlewares/isAdmin.js");

const router = express.Router();


// Public
router.get("/get-profile",protected, getProfileById);
router.put("/update-profile", protected, upload.single("avatar"), updateUserProfile);
router.put("/change-password", protected, changePassword);
router.delete("/delete-profile", protected, deleteMyAccount);

// Email verification and notification for password change
// Request password reset (email link)
router.post("/request-password-reset", requestPasswordReset);
// Reset password (token, email, newPassword)
router.post("/reset-password", resetPassword)

// Admin
router.get("/admin/get-users", protected, isAdmin, getAllProfiles);
router.delete("/admin/delete-user/:id", protected, isAdmin, deleteUser);


module.exports = router;
