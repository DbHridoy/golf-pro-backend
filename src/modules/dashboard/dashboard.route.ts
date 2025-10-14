import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/dashboard-data", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getDashboardData);
router.get("/stats", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getUserStats);
router.get("/analytics", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getAnalyticsData);
router.get("/users-except-admin", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), dashboardController.getUsersExceptAdmin);
router.get("/reports", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getReports);


export default router;
