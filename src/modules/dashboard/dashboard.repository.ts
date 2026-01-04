import { logger } from "@/middlewares/pino-logger";

import GolferModel from "../golfer/golfer.model";
import PostModel from "../posts/posts.model";
import UserModel from "../user/user.model";
import { NotFoundException } from "@/utils/app-error.utils";
import AdminModel from "../admin/admin.model";

class DashboardRepository {
  async getUserStats() {
    const rawStats = await UserModel.aggregate([
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

  async getActiveUsers() {
    const users = await UserModel.find({
      role: { $in: ["golfer", "golf_club"] },
      isActive: true,
    }).countDocuments();
    return users;
  }

  async getTotalUsers() {
    const users = await UserModel.find({
      role: { $in: ["golfer", "golf_club"] },
    }).countDocuments();
    return users;
  }

  async getUsersExceptAdmin() {
    const users = await UserModel.find({
      role: { $in: ["golfer", "golf_club"] }, // since "admin" isn't in this array anyway
    }).lean();

    return users;
  }

  async getReportedPosts() {
    const posts = await PostModel.find({ isActive: false }).lean();
    return posts;
  }

  async getReportedGolfers() {
    const users = await GolferModel.find({ isActive: false }).lean();
    logger.info(users, "reported users from repository");
    return users;
  }

  async getAllGolfers() {
    const golfers = await GolferModel.find({}).lean();
    return golfers;
  }

  async updateInDB(profileId: string, updateData: any) {
    const profile = await AdminModel.findByIdAndUpdate(
      profileId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({ path: "userId", select: "fullName email handicapIndex" })
      .lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    logger.info(`from golfer repository ${profile}`);
    return profile;
  }
}

export const dashboardRepository = new DashboardRepository();
