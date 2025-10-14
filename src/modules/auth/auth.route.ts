import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { authController } from "./auth.controller";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "admin"]), authController.logout);
router.post("/send-otp", authController.resetPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/set-password", authMiddleware.authenticate, authController.setNewPassword);
router.post("/ghin-login", authController.ghinLogin);

export default router;
