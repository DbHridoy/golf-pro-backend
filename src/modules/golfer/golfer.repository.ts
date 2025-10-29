import mongoose from "mongoose";

import { logger } from "@/middlewares/pino-logger";

import "../club/club.model";
import { NotFoundException } from "@/utils/app-error.utils";

import GolferModel from "./golfer.model";

export class GolferRepository {
  async createProfile(userId: string, profileData) {
    const profile = new GolferModel({
      userId,
      ...profileData,
    });

    return await profile.save();
  }

  async toggleGolferActiveStatus(
    userId: string,
    isActive: boolean,
  ) {
    logger.info("from golfer repository");

    const updatedGolfer = await GolferModel.findOneAndUpdate(
      { userId },
      { isActive },
      { new: true, lean: true },
    );

    if (!updatedGolfer) {
      logger.warn(`No golfer found with userId: ${userId}`);
      return null;
    }

    logger.info(updatedGolfer, "updated from golfer repository");
    return updatedGolfer;
  }

  // async findByUserId(userId: string)= {
  //   return await GolferModel.findOne({ userId })
  //     .lean();
  // }

  async findGolferByUserId(userId) {
    // logger.info('golfer id from reposotory', golferid);
    const profile = await GolferModel.findOne({ userId })
      .populate({ path: "userId", select: "fullName email" })
      .lean();

    if (!profile)
      throw new NotFoundException("Golfer profile not found");
    logger.info(profile, "findbyid in repository");
    return profile;
  }

  async updateInDB(profileId: string, updateData) {
    const profile = await GolferModel.findByIdAndUpdate(
      profileId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate({ path: "userId", select: "fullName email" }).lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    return profile;
  }

  /**
   * Get paginated golfer profiles with filters
   */
  // async getAllGolfers(query: any, filters: GolferProfileFilters = {}) {
  //   // logger.info(query, "Getting profiles from repository");
  //   if (!query) {
  //     return GolferModel.find().lean();
  //   }

  //   const paginateOptions = PaginationHelper.parsePaginationParams(query);

  //   // Build search filter
  //   const searchFields = ["fullName", "bio", "city", "country"];
  //   const filter = PaginationHelper.createSearchFilter(query, searchFields);

  //   // Add custom filters
  //   if (filters.gender) {
  //     filter.gender = filters.gender;
  //   }

  //   if (filters.country) {
  //     filter.country = new RegExp(filters.country, "i");
  //   }

  //   if (filters.city) {
  //     filter.city = new RegExp(filters.city, "i");
  //   }

  //   if (filters.isProfilePublic !== undefined) {
  //     filter.isProfilePublic = filters.isProfilePublic;
  //   }

  //   if (filters.hasProfileImage !== undefined) {
  //     filter.profileImage = filters.hasProfileImage ? { $exists: true, $ne: null } : { $exists: false };
  //   }

  //   // Age filter (requires aggregation)
  //   if (filters.minAge !== undefined || filters.maxAge !== undefined) {
  //     const today = new Date();
  //     const currentYear = today.getFullYear();

  //     if (filters.maxAge !== undefined) {
  //       const minBirthYear = currentYear - filters.maxAge - 1;
  //       filter.dateOfBirth = { ...filter.dateOfBirth, $gte: new Date(minBirthYear, 0, 1) };
  //     }

  //     if (filters.minAge !== undefined) {
  //       const maxBirthYear = currentYear - filters.minAge;
  //       filter.dateOfBirth = { ...filter.dateOfBirth, $lte: new Date(maxBirthYear, 11, 31) };
  //     }
  //   }

  //   const result = await GolferModel.paginate(filter, {
  //     ...paginateOptions,
  //     populate: [
  //       { path: "clubs", select: "clubName" },
  //       { path: "friends", select: "fullName" },
  //     ],
  //   });

  //   return PaginationHelper.formatResponse(result);
  // }
  /**
   * Search nearby golfers using geospatial query
   */

  async getAllGolfers() {
    return await GolferModel.find().lean();
  }

  // async searchNearbyGolfers(searchParams) {
  //   const { latitude, longitude, radius, page = 1, limit = 10 } = searchParams;

  //   const pipeline: any[] = [
  //     {
  //       $geoNear: {
  //         near: {
  //           type: "Point",
  //           coordinates: [longitude, latitude],
  //         },
  //         distanceField: "distance",
  //         maxDistance: radius * 1000, // Convert km to meters
  //         spherical: true,
  //         query: {
  //           isProfilePublic: true,
  //           location: { $exists: true },
  //         },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "clubs",
  //         localField: "clubMemberships",
  //         foreignField: "_id",
  //         as: "clubMemberships",
  //         pipeline: [{ $project: { name: 1, description: 1 } }],
  //       },
  //     },
  //     {
  //       $addFields: {
  //         distanceInKm: { $divide: ["$distance", 1000] },
  //       },
  //     },
  //     {
  //       $sort: { distance: 1 },
  //     },
  //   ];

  //   const options = {
  //     page,
  //     limit,
  //     // customLabels: PaginationHelper.formatResponse({} as any).pagination,
  //   };

  //   const result = await GolferModel.aggregatePaginate(
  //     GolferModel.aggregate(pipeline),
  //     options,
  //   );

  //   return PaginationHelper.formatResponse(result);
  // }

  /**
   * Check if golfer profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    const profile = await GolferModel.findOne({ userId }).lean();
    return !!profile;
  }

  /**
   * Delete golfer profile
   */
  async deleteProfile(profileId: string): Promise<boolean> {
    const result = await GolferModel.findByIdAndDelete(profileId);
    return !!result;
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(profileId: string, isOnline: boolean) {
    await GolferModel.findByIdAndUpdate(profileId, {
      isOnline,
      lastActiveAt: new Date(),
    });
  }

  /**
   * Add friend to golfer's friend list
   */
  async addFriend(profileId: string, friendId: string) {
    const profile = await GolferModel.findByIdAndUpdate(
      profileId,
      { $addToSet: { friends: friendId } },
      { new: true },
    ).lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    return profile;
  }

  /**
   * Remove friend from golfer's friend list
   */
  async removeFriend(profileId: string, friendId: string) {
    const profile = await GolferModel.findByIdAndUpdate(
      profileId,
      { $pull: { friends: friendId } },
      { new: true },
    ).lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    return profile;
  }

  /**
   * Add club membership
   */
  async addClubMembership(profileId: string, clubId: string) {
    const profile = await GolferModel.findByIdAndUpdate(
      profileId,
      { $addToSet: { clubMemberships: clubId } },
      { new: true },
    ).lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    return profile;
  }

  /**
   * Remove club membership
   */
  async removeClubMembership(profileId: string, clubId: string) {
    const profile = await GolferModel.findByIdAndUpdate(
      profileId,
      { $pull: { clubMemberships: clubId } },
      { new: true },
    ).lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    return profile;
  }
}

export const golferRepository = new GolferRepository();
