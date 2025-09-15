import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { authController } from "./auth.controller";
import { authService } from "./auth.service";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "system_admin"]), authController.refreshToken);
router.post("/logout", authController.logout);

// Password management
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Email verification
router.post("/verify-email", authController.verifyEmail);

// Authenticated routes (TODO: Add auth middleware)
router.post("/change-email", authController.changeEmail);

export default router;
