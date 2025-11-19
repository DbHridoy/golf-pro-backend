import { logger } from "@/middlewares/pino-logger";

import { clubRepository } from "../club/club.repository";
import EventModel from "../events/event.model";
import { golferRepository } from "../golfer/golfer.repository";
import UserModel from "../user/user.model";
import { dashboardRepository } from "./dashboard.repository";
import { membershipRepository } from "../memberships/memberships.repository";

// interface DashboardMetrics {
//   activeUsers: number;
//   activeGameEvents: number;
//   totalUsers: number;
//   userMetrics: UserGrowthMetric[];
//   lastUpdated: Date;
// }

interface UserGrowthMetrics {
  weekly: Array<{ week: string; newUsers: number }>;
  monthly: Array<{ month: string; newUsers: number }>;
  yearly: Array<{ year: number; newUsers: number }>;
}

interface PlatformOverview {
  activeUsers: number;
  newSignups: number;
  totalUsers: number;
  activeEvents: number;
  totalEvents: number;
}

interface EventsOverview {
  today: number;
  upcoming: number;
  all: number;
}

interface EventsMetrics {
  weekly: Array<{ week: string; newUsers: number }>;
  monthly: Array<{ month: string; newUsers: number }>;
  yearly: Array<{ year: number; newUsers: number }>;
}

interface UserGrowthPoint {
  period: string;
  newUsers: number;
  timestamp: Date;
}

interface DashboardData {
  platformOverview: PlatformOverview;
  userMetrics: UserGrowthMetrics;
  eventsOverview: EventsOverview;
  eventsMetrics: EventsMetrics;
  lastUpdated: Date;
}

class DashboardService {
  /**
   * Get all dashboard metrics in a single call
   */
  async getDashboardMetrics() {
    const [activeGameEvents] = await Promise.all([this.getActiveGameEvents()]);

    const activeUsers = await dashboardRepository.getActiveUsers();
    const totalUsers = await dashboardRepository.getTotalUsers();
    const dashboardData = {
      activeUsers,
      activeGameEvents,
      totalUsers,
      lastUpdated: new Date(),
    };

    return dashboardData;
  }

  //
  /**
   * Get complete dashboard data
   */
  async getCompleteDashboard(): Promise<DashboardData> {
    try {
      const [platformOverview, userMetrics, eventsOverview, eventsMetrics] =
        await Promise.all([
          this.getPlatformOverview(),
          dashboardRepository.getUserStats(),
          this.getEventsOverview(),
          this.getEventsMetrics(),
        ]);

      return {
        platformOverview,
        userMetrics,
        eventsOverview,
        eventsMetrics,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          method: "getCompleteDashboard",
        },
        "Error fetching complete dashboard"
      );
      throw error;
    }
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

  getAllGolfers() {
    const golfers = golferRepository.getAllGolfers();
    return golfers;
  }

  //   async getSingleGolferProfile(golferId: string) {
  //     const profile = await golferProfileRepository.findGolferByUserId(golferId);
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
  //     const currentUser = await golferProfileRepository.findGolferByUserId(userId);
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
  getAllClubs() {
    const clubs = clubRepository.getAllClubs();
    return clubs;
  }

  /**
   * Get count of active game events (upcoming or currently active)
   */
  private async getActiveGameEvents(): Promise<number> {
    try {
      const count = await EventModel.countDocuments({
        status: { $in: ["upcoming", "active"] },
        eventDate: { $gte: new Date() },
      });

      return count;
    } catch (error) {
      logger.error({ error }, "Error fetching active game events count");
      throw error;
    }
  }

  /**
   * Get platform overview metrics
   */
  private async getPlatformOverview(): Promise<PlatformOverview> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [activeUsers, totalUsers, newSignups, activeEvents, totalEvents] =
        await Promise.all([
          // Active users: logged in within last 30 days
          UserModel.countDocuments({
            isActive: true,
            role: { $in: ["golfer", "golf_club"] },
          }),

          // Total users
          UserModel.countDocuments({ isActive: true }),
          // New signups: registered in last 7 days
          UserModel.countDocuments({
            isActive: true,
            createdAt: { $gte: sevenDaysAgo },
          }),
          // Active events: upcoming or active status
          EventModel.countDocuments({
            status: { $in: ["upcoming", "active"] },
            eventDate: { $gte: new Date() },
          }),
          // Total events: all events (not cancelled)
          EventModel.countDocuments({
            status: { $ne: "cancelled" },
          }),
        ]);

      return {
        activeUsers,
        newSignups,
        totalUsers,
        activeEvents,
        totalEvents,
      };
    } catch (error) {
      logger.error({ error }, "Error fetching platform overview");
      throw error;
    }
  }

  /**
   * Get events overview metrics (Today, Upcoming, All)
   */
  private async getEventsOverview(): Promise<EventsOverview> {
    try {
      const now = new Date();

      // Start of today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // End of today
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const [today, upcoming, all] = await Promise.all([
        // Events today
        EventModel.countDocuments({
          eventDate: { $gte: todayStart, $lte: todayEnd },
          status: { $ne: "cancelled" },
        }),
        // Upcoming events (from tomorrow onwards)
        EventModel.countDocuments({
          eventDate: { $gt: todayEnd },
          status: { $in: ["upcoming", "active"] },
        }),
        // All events (excluding cancelled and drafts)
        EventModel.countDocuments({
          status: { $in: ["completed", "active", "upcoming"] },
        }),
      ]);

      return {
        today,
        upcoming,
        all,
      };
    } catch (error) {
      logger.error({ error }, "Error fetching events overview");
      throw error;
    }
  }

  /**
   * Get user growth metrics by time period
   */
  async getUserGrowthMetrics(
    period: "weekly" | "monthly" | "yearly"
  ): Promise<UserGrowthPoint[]> {
    try {
      let groupBy: any;
      let sortOrder: any;

      switch (period) {
        case "yearly":
          groupBy = {
            year: { $year: "$createdAt" },
          };
          sortOrder = { "_id.year": 1 };
          break;

        case "monthly":
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
          sortOrder = { "_id.year": 1, "_id.month": 1 };
          break;

        case "weekly":
          groupBy = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          };
          sortOrder = { "_id.year": 1, "_id.week": 1 };
          break;
      }

      const metrics = await UserModel.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: groupBy,
            newUsers: { $sum: 1 },
            firstDate: { $min: "$createdAt" },
          },
        },
        {
          $sort: sortOrder,
        },
        {
          $project: {
            _id: 0,
            period: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [period, "yearly"] },
                    then: { $toString: "$_id.year" },
                  },
                  {
                    case: { $eq: [period, "monthly"] },
                    then: {
                      $concat: [
                        { $toString: "$_id.year" },
                        "-",
                        {
                          $cond: [
                            { $lt: ["$_id.month", 10] },
                            { $concat: ["0", { $toString: "$_id.month" }] },
                            { $toString: "$_id.month" },
                          ],
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: [period, "weekly"] },
                    then: {
                      $concat: [
                        { $toString: "$_id.year" },
                        "-W",
                        {
                          $cond: [
                            { $lt: ["$_id.week", 10] },
                            { $concat: ["0", { $toString: "$_id.week" }] },
                            { $toString: "$_id.week" },
                          ],
                        },
                      ],
                    },
                  },
                ],
                default: { $toString: "$_id.year" },
              },
            },
            newUsers: 1,
            timestamp: "$firstDate",
          },
        },
      ]);

      return metrics;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          period,
          method: "getUserGrowthMetrics",
        },
        "Error fetching user growth metrics"
      );
      throw error;
    }
  }

  async getEventsMetrics() {
    const rawStats = await EventModel.aggregate([
      { $match: { createdAt: { $exists: true } } },
      {
        $facet: {
          weekly: [
            {
              $group: {
                _id: {
                  year: { $isoWeekYear: "$createdAt" },
                  week: { $isoWeek: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
          ],
          monthly: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
          yearly: [
            {
              $group: {
                _id: { year: { $year: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1 } },
          ],
        },
      },
    ]);

    // Transform to your desired format
    const stats = {
      weekly: rawStats[0].weekly.map((w: any) => ({
        week: `Week ${w._id.week}`,
        newUsers: w.count,
      })),
      monthly: rawStats[0].monthly.map((m: any) => ({
        month: new Date(m._id.year, m._id.month - 1).toLocaleString("default", {
          month: "long",
        }),
        newUsers: m.count,
      })),
      yearly: rawStats[0].yearly.map((y: any) => ({
        year: y._id.year,
        newUsers: y.count,
      })),
    };

    return stats;
  }

 async getMembersOfaClub(clubId: string) {
    const club = await clubRepository.findClubById(clubId);
    if (!club) {
      throw new Error("Club not found");
    }
    logger.info({club},"club from dashboard service");
    const clubUserId = club.userId;
    const clubMembers = membershipRepository.findMembersByClubId(clubUserId);
    return clubMembers;
  }
}

export const dashboardService = new DashboardService();
