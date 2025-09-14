import { Router } from "express";

import { authController } from "./auth.controller";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

// Password management
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Email verification
router.post("/verify-email", authController.verifyEmail);

// Authenticated routes (TODO: Add auth middleware)
router.post("/change-email", authController.changeEmail);

export default router;
