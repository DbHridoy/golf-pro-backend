import { Router } from "express";

import { validate } from "@/middlewares/validate.middleware";

import { authController } from "./auth.controller";
import { createUserSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(createUserSchema), authController.register);
router.post("/login", authController.login);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/set-password", authController.setNewPassword);
// router.post("/google-login", authController.googleLogin);
// router.post("/ghin-login", authController.ghinLogin);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
