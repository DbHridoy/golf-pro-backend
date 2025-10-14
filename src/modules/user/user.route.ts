import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { userController } from "./user.controller";

const router = Router();

router.get("/", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), userController.getUsers);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/verify-email", userController.verifyEmail); // verify email
router.post("/change-email", userController.changeEmail); // Change email (TODO: Add auth middleware)


router.get("/:id", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "admin"]), userController.getUserById);
router.patch("/:id", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "admin"]), userController.updateUser);
router.patch("/:id/change-password", userController.changePassword);

// Password management

// Email management

// Stats

export default router;
