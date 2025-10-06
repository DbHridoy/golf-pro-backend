import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { authController } from "./auth.controller";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "admin"]), authController.logout);

export default router;
