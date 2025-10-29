import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";

import { golferRepository } from "../golfer/golfer.repository";
import { golferService } from "../golfer/golfer.service";
import { dashboardService } from "./dashboard.service";

class DashboardController {
  async getDashboardData(_req: Request, res: Response, _next: NextFunction) {
    const dashboardData = await dashboardService.dashboardData();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  }

  async getUserStats(req: Request, res: Response, _next: NextFunction) {
    const userStats = await dashboardService.getUserStats();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "User stats fetched successfully",
      data: userStats,
    });
  }

  async getAnalyticsData(req: Request, res: Response, _next: NextFunction) {
    const analyticsData = await dashboardService.getAnalyticsData();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Analytics data fetched successfully",
      data: analyticsData,
    });
  }

  async getUsersExceptAdmin(req: Request, res: Response, _next: NextFunction) {
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
    const reports = [...reportedPosts, ...reportedUsers];
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Reported posts fetched successfully",
      data: reports,
    });
  }

  async getAllGolfers(req: Request, res: Response, _next: NextFunction) {
    const golfers = await dashboardService.getAllGolfers();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Golfers fetched successfully",
      data: golfers,
    });
  }

  getGolferProfiles = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // logger.info(req, "Getting profiles from controller");
    const result = await golferRepository.getAllGolfers();
    return res.status(HTTPSTATUS.OK).json(result);
  });

  // getSingleGolferProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   const { id } = req.params; // ← access the param
  //   const profile = await golferProfileRepository.findGolferByUserId(id);
  //   return res.status(HTTPSTATUS.OK).json(profile);
  // });

  // async toggleGolferStatus(req: Request, res: Response, _next: NextFunction) {
  //   const { id } = req.params; // ← access the param
  //   const profile = await golferService.toggleGolferActiveStatus(id);
  //   return res.status(HTTPSTATUS.OK).json(profile);
  // }
  getAllClubs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const clubs = await dashboardService.getAllClubs();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Clubs fetched successfully",
      data: clubs,
    });
  });
}

export const dashboardController = new DashboardController();
