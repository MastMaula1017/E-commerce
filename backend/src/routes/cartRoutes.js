import express from "express";
import {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
} from "../controllers/cartController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get current user's cart
router.get("/", getCart);

// Manage items in cart
router.post("/items", addItem);
router.put("/items", updateItem);
router.delete("/items", removeItem);

// Clear entire cart
router.delete("/", clearCart);

export default router;
