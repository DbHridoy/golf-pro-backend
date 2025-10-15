// import { logger } from "@/middlewares/pino-logger";

// import { dashboardRepository } from "./dashboard.repository";

// class DashboardService {
//   async dashboardData() {
//     const activeUsers = await dashboardRepository.getActiveUsers();
//     const totalUsers = await dashboardRepository.getTotalUsers();
//     const dashboardData = { activeUsers, totalUsers };
//     return dashboardData;
//   }

//   async getUserStats() {
//     const userStats = await dashboardRepository.getUserStats();
//     return userStats;
//   }

//   async getAnalyticsData() {
//     const activeUsers = await dashboardRepository.getActiveUsers();
//     const totalUsers = await dashboardRepository.getTotalUsers();
//     const analyticsData = { activeUsers, totalUsers };
//     return analyticsData;
//   }

//   async getUsersExceptAdmin() {
//     const users = await dashboardRepository.getUsersExceptAdmin();
//     return users;
//   }

//   async getReportedPosts() {
//     const reportedPosts = await dashboardRepository.getReportedPosts();
//     return reportedPosts;
//   }

//   async getReportedUsers() {
//     const reportedUsers = await dashboardRepository.getReportedGolfers();
//     logger.info(reportedUsers, "reported users from service");
//     return reportedUsers;
//   }

//   getAllGolfers() {
//     const golfers = dashboardRepository.getAllGolfers();
//     return golfers;
//   }

//   async getSingleGolferProfile(golferId: string) {
//     const profile = await golferProfileRepository.findGolferById(golferId);
//     if (!profile) {
//       throw new NotFoundException("Golfer profile not found");
//     }
//     else {
//       return ({
//         success: true,
//         data: profile,
//         message: "Golfer profile fetched successfully",
//       });
//     }
//   }

//   async getAllProfiles() {
//     const profiles = await golferProfileRepository.getAllGolfers();
//     if (!profiles) {
//       throw new NotFoundException("Golfer profiles not found");
//     }
//     else {
//       return ({
//         success: true,
//         data: profiles,
//         message: "Golfer profiles fetched successfully",
//       });
//     }
//   }

//   async toggleGolferActiveStatus(userId: string) {
//     logger.info("befor finding from golfer service");
//     const currentUser = await golferProfileRepository.findGolferById(userId);
//     logger.info(currentUser, "from golfer service");
//     logger.info(userId, "userid from service");

//     if (!currentUser) {
//       throw new NotFoundException("Golfer profile not found");
//     }
//     const isActive = !currentUser.isActive;
//     const updatedGolfer = await golferProfileRepository.toggleGolferActiveStatus(userId, isActive);
//     logger.info(updatedGolfer, "updated from golfer service");
//     return updatedGolfer;
//   }
// }

// export const dashboardService = new DashboardService();
