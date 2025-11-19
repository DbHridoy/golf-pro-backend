import ClubModel from "../club/club.model";
import PostModel from "../posts/posts.model";
import UserModel from "../user/user.model";
import reportRepository from "./report.repository";

class ReportService {
  async createReport(
    reporterId: string,
    data: any,
  ): Promise<any> {
    // if (data.reportedUserId && reporterId === data.reportedUserId) {
    //   throw new Error("You cannot report your own profile");
    // }

    if (data.reportedClubId) {
      const club = await ClubModel.findById(data.reportedClubId);
      if (club && reporterId === club.userId.toString()) {
        throw new Error("You cannot report your own club profile");
      }
    }

    const duplicateReport = await reportRepository.findDuplicateReport(reporterId, data.reportedUserId, data.reportedClubId, data.reportedPostId, data.contentType);

    if (duplicateReport) {
      throw new Error("You have already reported this content");
    }

    if (data.contentType === "profile" && data.targetType === "golfer") {
      const golfer = await UserModel.findById(data.reportedUserId);
      if (!golfer) {
        throw new Error("Reported golfer not found");
      }
    }

    if (data.contentType === "profile" && data.targetType === "club") {
      const club = await ClubModel.findById(data.reportedClubId);
      if (!club) {
        throw new Error("Reported club not found");
      }
    }

    if (data.contentType === "post") {
      const post = await PostModel.findById(data.reportedPostId);
      if (!post) {
        throw new Error("Reported post not found");
      }
    }

    const report = await reportRepository.createReport({
      ...data,
      reporterId,
    });

    return report;
  }

  async getAllReports(page: number = 1, limit: number = 10, filters?: {
    isResolved?: boolean;
    contentType?: string;
    targetType?: string;
  }): Promise<any> {
    return await reportRepository.getAllReports(page, limit, filters);
  }

  async getReportById(reportId: string): Promise<any> {
    const report = await reportRepository.findReportById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const report = await reportRepository.findReportById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    return await reportRepository.deleteReport(reportId);
  }
}

const reportService = new ReportService();

export default reportService;
