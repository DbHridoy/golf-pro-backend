import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { golferProfileController } from "./golfer-profile.controller";

const router: Router = Router();

// Authenticated routes (requires login)
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "system_admin"]), golferProfileController.createProfile);

export default router;
