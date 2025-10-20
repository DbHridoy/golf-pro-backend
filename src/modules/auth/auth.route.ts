import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/set-password", authController.setNewPassword);
router.post("/login", authController.login);
// router.post("/ghin-login", authController.ghinLogin);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleware.authenticate, authController.logout);

export default router;
