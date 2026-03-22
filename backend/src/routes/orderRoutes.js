import express from "express";
import {
    createOrderFromCart,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Admin routes
router.get("/admin/all", authorize("admin"), getAllOrders);
router.patch("/:id/status", authorize("admin"), updateOrderStatus);

// User routes
router.get("/", getMyOrders);
router.post("/", createOrderFromCart);
router.get("/:id", getOrderById);

export default router;
