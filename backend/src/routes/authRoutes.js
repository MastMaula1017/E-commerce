import express from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.post("/logout", authenticate, logout);

// Get current user
router.get("/me", authenticate, getMe);

export default router;
