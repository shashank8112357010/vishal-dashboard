import express from "express";
import { getMe, logout, refresh, signin, signup } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refresh);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
