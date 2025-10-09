import { logger } from "@/middlewares/pino-logger";
import { dashboardRepository } from "./dashboard.repository";

class DashboardService {
  async dashboardData() {
    const activeUsers = await dashboardRepository.getActiveUsers();
    const totalUsers = await dashboardRepository.getTotalUsers();
    const dashboardData = { activeUsers, totalUsers };
    return dashboardData;
  }

  async getUserStats() {
    const userStats = await dashboardRepository.getUserStats();
    return userStats;
  }

  async getAnalyticsData() {
    const activeUsers = await dashboardRepository.getActiveUsers();
    const totalUsers = await dashboardRepository.getTotalUsers();
    const analyticsData = { activeUsers, totalUsers };
    return analyticsData;
  }
  async getUsersExceptAdmin() {
    const users = await dashboardRepository.getUsersExceptAdmin();
    return users;
  }

  async getReportedPosts() {
    const reportedPosts = await dashboardRepository.getReportedPosts();
    return reportedPosts;
  }
  async getReportedUsers() {
    const reportedUsers = await dashboardRepository.getReportedGolfers();
    logger.info(reportedUsers, "reported users from service");
    return reportedUsers;
  }
}

export const dashboardService = new DashboardService();
