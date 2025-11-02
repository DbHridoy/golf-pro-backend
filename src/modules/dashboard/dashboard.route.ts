import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import adminController from "../admin/admin.controller";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/get-all-golfers", dashboardController.getAllGolfers);
router.get("/get-all-clubs", dashboardController.getAllClubs);
router.get("/dashboard-data", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getDashboardData);
router.get("/stats", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getUserStats);
router.get("/analytics", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getAnalyticsData);
router.get("/users-except-admin", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), dashboardController.getUsersExceptAdmin);
router.get("/reports", authMiddleware.authenticate, authMiddleware.authorize(["admin", "golfer", "golf_club"]), dashboardController.getReports);
router.get("/get-any-user/:userId", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), adminController.getAnyUser);
router.get("/get-all-users", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), adminController.getAllUsers);
// router.get(
//   "/get-golfer-profile/:id",
//   authMiddleware.authenticate,
//   authMiddleware.authorize(["golfer", "golf_club", "admin"]),
//   golferProfileController.getSingleGolferProfile,
// );

// router.patch(
//   "/toggle-golfer-status/:id",
//   authMiddleware.authenticate,
//   authMiddleware.authorize(["admin", "golf_club"]),
//   golferProfileController.toggleGolferStatus,
// );

export default router;
