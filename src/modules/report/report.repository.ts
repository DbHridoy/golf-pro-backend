import { logger } from "@/middlewares/pino-logger";

import ReportModel from "./report.model";

class ReportRepository {
  async createReport(data: any): Promise<any> {
    logger.info({ data }, "from report repo");
    const report = new ReportModel(data);
    return await report.save();
  }

  async findReportById(id: string): Promise<any | null> {
    return await ReportModel.findById(id)
      .populate("reporterId", "fullName email role")
      .populate("reportedUserId", "fullName email")
      .populate("reportedClubId", "clubName")
      .populate("reportedPostId", "postTitle")
      .populate("adminId", "fullName");
  }

  async findDuplicateReport(
    reporterId: string,
    reportedUserId?: string,
    reportedClubId?: string,
    reportedPostId?: string,
    contentType?: string,
  ): Promise<any | null> {
    const query: any = { reporterId };

    if (contentType) {
      query.contentType = contentType;
    }

    if (reportedPostId) {
      query.reportedPostId = reportedPostId;
    }
    else if (reportedUserId) {
      query.reportedUserId = reportedUserId;
    }
    else if (reportedClubId) {
      query.reportedClubId = reportedClubId;
    }

    return await ReportModel.findOne(query);
  }

  async getAllReports(
    page: number = 1,
    limit: number = 10,
    filters?: {
      isResolved?: boolean;
      contentType?: string;
      targetType?: string;
    },
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.isResolved !== undefined) {
      query.isResolved = filters.isResolved;
    }
    if (filters?.contentType) {
      query.contentType = filters.contentType;
    }
    if (filters?.targetType) {
      query.targetType = filters.targetType;
    }

    const reports = await ReportModel.find(query)
      .populate("reporterId", "fullName email role")
      .populate("reportedUserId", "fullName email")
      .populate("reportedClubId", "clubName")
      .populate("reportedPostId", "postTitle")
      .populate("adminId", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReportModel.countDocuments(query);

    return {
      reports,
      total,
      page,
      limit,
    };
  }

  async getReportsForUser(userId: string): Promise<any[]> {
    return await ReportModel.find({
      $or: [
        { reportedUserId: userId },
        { reportedClubId: userId }, // When club is created with userId
      ],
    })
      .populate("reporterId", "fullName email role")
      .populate("adminId", "fullName")
      .sort({ createdAt: -1 });
  }

  async getReportsForPost(postId: string): Promise<any[]> {
    return await ReportModel.find({ reportedPostId: postId })
      .populate("reporterId", "fullName email role")
      .populate("adminId", "fullName")
      .sort({ createdAt: -1 });
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const result = await ReportModel.findByIdAndDelete(reportId);
    return result !== null;
  }
}

const reportRepository = new ReportRepository();

export default reportRepository;
