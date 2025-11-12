import express from "express";
import {
  login,
  logout,
  register,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", isLoggedIn, getProfile);
router.put("/update/:id", isLoggedIn, updateProfile);

export default router;
