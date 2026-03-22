import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Public listing & details
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only CRUD
router.post("/", authenticate, authorize("admin"), createProduct);
router.put("/:id", authenticate, authorize("admin"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;
