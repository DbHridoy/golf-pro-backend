import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { userController } from "./user.controller";

const router = Router();
// authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]),

router.post("/change-email", userController.changeEmail); // Change email (TODO: Add auth middleware)

// router.post("/forgot-password", userController.sendOtp);
// router.post("/reset-password", userController.sendOtp);
// router.post("/verify-email", userController.verifyEmail); // verify email

// Media routes
router.get("/",  userController.getUsers);
router.get("/media", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club"]), userController.getUserMedia);
router.get("/:id", userController.getUserById);

// User CRUD routes
router.patch("/toggle-status/:userId",userController.toggleActiveStatus)
router.patch("/:id", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "admin"]), userController.updateUser);
router.patch("/:id/change-password", userController.changePassword);


export default router;
