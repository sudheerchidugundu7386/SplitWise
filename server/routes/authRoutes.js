const express = require("express");
const router = express.Router();
const { register, login, getMe, getUserProfile } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.get("/profile", requireAuth, getUserProfile);

module.exports = router;
