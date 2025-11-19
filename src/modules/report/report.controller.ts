import type { Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";

import reportService from "./report.service";

class ReportController {
  createReport = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log("ReportController: createReport", req.body);
      try {
        const reporterId = req.user?.userId;
        if (!reporterId) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }

        const data = req.body;

        if (!data.reason || data.reason.trim().length === 0) {
          res.status(400).json({ message: "Reason is required" });
        }

        if (
          !data.contentType ||
          !["profile", "post"].includes(data.contentType)
        ) {
          res.status(400).json({ message: "Invalid content type" });
        }

        if (!data.targetType || !["golfer", "club"].includes(data.targetType)) {
          res.status(400).json({ message: "Invalid target type" });
        }

        if (
          data.contentType === "profile" &&
          !data.reportedUserId &&
          !data.reportedClubId
        ) {
          res.status(400).json({
            message:
              "reportedUserId or reportedClubId is required for profile reports",
          });
        }

        if (data.contentType === "post" && !data.reportedPostId) {
          res
            .status(400)
            .json({ message: "reportedPostId is required for post reports" });
        }

        const report = await reportService.createReport(reporterId, data);

        res.status(HTTPSTATUS.CREATED).json({
          message: "Report submitted successfully",
          data: report,
        });
      } catch (error: unknown) {
        res.status(400).json({ message: error });
      }
    }
  );

  async getAllReports(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      const userRole = req.user?.role;
      if (userRole !== "admin") {
        res.status(403).json({ message: "Only admins can view all reports" });
        return;
      }

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const isResolved = req.query.isResolved
        ? req.query.isResolved === "true"
        : undefined;
      const contentType = (req.query.contentType as string) || undefined;
      const targetType = (req.query.targetType as string) || undefined;

      const result = await reportService.getAllReports(page, limit, {
        isResolved,
        contentType,
        targetType,
      });

      res.status(200).json({
        message: "Reports retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;

      const userRole = req.user?.role;
      if (userRole !== "admin") {
        res.status(403).json({ message: "Only admins can view reports" });
        return;
      }

      const report = await reportService.getReportById(reportId);

      res.status(200).json({
        message: "Report retrieved successfully",
        data: report,
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const userRole = req.user?.role;

      if (userRole !== "admin") {
        res.status(403).json({ message: "Only admins can delete reports" });
        return;
      }

      const isDeleted = await reportService.deleteReport(reportId);

      if (!isDeleted) {
        res.status(404).json({ message: "Report not found" });
        return;
      }

      res.status(200).json({
        message: "Report deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const reportController = new ReportController();

export default reportController;
