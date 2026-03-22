import express from "express";

const router = express.Router();

// Placeholder route to confirm admin routes are wired
router.get("/test", (req, res) => {
    res.json({ message: "Admin routes working" });
});

export default router;
