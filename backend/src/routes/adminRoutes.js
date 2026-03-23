import express from "express";
import {
    listUsers,
    updateUserStatus,
    getAdminMetrics,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// All admin routes require admin access
router.use(authenticate, authorize("admin"));

// Users management
router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);

// Basic metrics for dashboard
router.get("/metrics", getAdminMetrics);

export default router;
