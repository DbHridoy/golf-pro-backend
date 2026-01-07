import { Router } from "express";

import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";

import adminController from "../admin/admin.controller";
import dashboardController from "./dashboard.controller";

const router = Router();

router.use(authMiddleware.authenticate);
/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get complete dashboard data (all metrics in one call)
 * @access  Private (Admin only)
 */
router.get("/get-my-profile", dashboardController.getMyProfile);

router.patch(
  "/update-my-profile",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  dashboardController.updateProfile,
);

router.get(
  "/analytics",
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorize("admin"),
  asyncHandler(
    dashboardController.getCompleteDashboard.bind(dashboardController)
  )
);

router.get("/get-all-golfers", dashboardController.getAllGolfers);
router.get("/get-all-clubs", dashboardController.getAllClubs);

router.get(
  "/dashboard-data",
  authMiddleware.authorize(["admin", "golfer", "golf_club"]),
  dashboardController.getDashboardData
);
router.get(
  "/stats",
  authMiddleware.authorize(["admin", "golfer", "golf_club"]),
  dashboardController.getUserStats
);
router.get(
  "/analytics",
  authMiddleware.authorize(["admin", "golfer", "golf_club"]),
  dashboardController.getAnalyticsData
);
router.get(
  "/users-except-admin",
  authMiddleware.authorize(["admin"]),
  dashboardController.getUsersExceptAdmin
);
router.get(
  "/reports",
  authMiddleware.authorize(["admin", "golfer", "golf_club"]),
  dashboardController.getReports
);

router.get("/get-members-of-a-club/:clubId", dashboardController.getMembersOfaClub)

router.get(
  "/get-any-user/:userId",
  authMiddleware.authorize(["admin"]),
  adminController.getAnyUser
);
router.get(
  "/get-all-users",
  authMiddleware.authorize(["admin"]),
  adminController.getAllUsers
);
// router.get(
//   "/get-golfer-profile/:id",
//   authMiddleware.authenticate,
//   authMiddleware.authorize(["golfer", "golf_club", "admin"]),
//   golferProfileController.getSingleGolferProfile,
// );

router.patch(
  "/toggle-golfer-status/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize(["admin", "golf_club"])
  //   golferProfileController.toggleGolferStatus,
);

export default router;
