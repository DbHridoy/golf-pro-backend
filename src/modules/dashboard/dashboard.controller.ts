import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";

import { dashboardService } from "./dashboard.service";
import { logger } from "@/middlewares/pino-logger";

class DashboardController {
  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    const dashboardData = await dashboardService.dashboardData();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  }

  async getUserStats(req: Request, res: Response, next: NextFunction) {
    const userStats = await dashboardService.getUserStats();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "User stats fetched successfully",
      data: userStats,
    });
  }

  async getAnalyticsData(req: Request, res: Response, next: NextFunction) {
    const analyticsData = await dashboardService.getAnalyticsData();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Analytics data fetched successfully",
      data: analyticsData,
    });
  }

  async getUsersExceptAdmin(req: Request, res: Response, next: NextFunction) {
    const users = await dashboardService.getUsersExceptAdmin();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  }

  async getReports(req: Request, res: Response, _next: NextFunction) {
    const reportedPosts = await dashboardService.getReportedPosts();
    const reportedUsers = await dashboardService.getReportedUsers();
    logger.info(reportedUsers, "reported users from controller");
    const reports=[...reportedPosts,...reportedUsers]
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Reported posts fetched successfully",
      data: reports,
    });
  }
}

export const dashboardController = new DashboardController();
