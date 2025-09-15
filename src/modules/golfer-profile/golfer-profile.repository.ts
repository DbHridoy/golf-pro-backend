import type { IGolferProfile } from "@/modules/golfer-profile/golfer-profile.interface";

import { NotFoundException } from "@/utils/app-error.utils";
import { PaginationHelper } from "@/utils/pagination-helper";

import type {
  GolferProfileFilters,
  LocationInput,
  NearbyGolferSearch,
} from "./golfer-profile.type";

import GolferProfileModel from "./golfer-profile.model";

export class GolferProfileRepository {
  /**
   * Create new golfer profile
   */
  async createProfile(userId: string, profileData: Partial<IGolferProfile>): Promise<IGolferProfile> {
    const profile = new GolferProfileModel({
      userId,
      ...profileData,
    });

    return await profile.save();
  }

  /**
   * Find golfer profile by user ID
   */
  async findByUserId(userId: string): Promise<IGolferProfile | null> {
    return await GolferProfileModel.findOne({ userId })
      .populate("clubMemberships", "name description")
      .populate("friends", "fullName profileImage")
      .lean();
  }

  /**
   * Find golfer profile by profile ID
   */
  async findById(profileId: string): Promise<IGolferProfile | null> {
    return await GolferProfileModel.findById(profileId)
      .populate("clubMemberships", "name description")
      .populate("friends", "fullName profileImage")
      .lean();
  }

  /**
   * Update golfer profile
   */
  async updateProfile(profileId: string, updateData: Partial<IGolferProfile>): Promise<IGolferProfile> {
    const profile = await GolferProfileModel.findByIdAndUpdate(
      profileId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("clubMemberships", "name description")
      .populate("friends", "fullName profileImage")
      .lean();

    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    return profile;
  }

  /**
   * Get paginated golfer profiles with filters
   */
  async getProfiles(query: any, filters: GolferProfileFilters = {}) {
    const paginateOptions = PaginationHelper.parsePaginationParams(query);

    // Build search filter
    const searchFields = ["fullName", "bio", "city", "country"];
    const filter = PaginationHelper.createSearchFilter(query, searchFields);

    // Add custom filters
    if (filters.gender) {
      filter.gender = filters.gender;
    }

    if (filters.country) {
      filter.country = new RegExp(filters.country, "i");
    }

    if (filters.city) {
      filter.city = new RegExp(filters.city, "i");
    }

    if (filters.isProfilePublic !== undefined) {
      filter.isProfilePublic = filters.isProfilePublic;
    }

    if (filters.hasProfileImage !== undefined) {
      filter.profileImage = filters.hasProfileImage ? { $exists: true, $ne: null } : { $exists: false };
    }

    // Age filter (requires aggregation)
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const today = new Date();
      const currentYear = today.getFullYear();

      if (filters.maxAge !== undefined) {
        const minBirthYear = currentYear - filters.maxAge - 1;
        filter.dateOfBirth = { ...filter.dateOfBirth, $gte: new Date(minBirthYear, 0, 1) };
      }

      if (filters.minAge !== undefined) {
        const maxBirthYear = currentYear - filters.minAge;
        filter.dateOfBirth = { ...filter.dateOfBirth, $lte: new Date(maxBirthYear, 11, 31) };
      }
    }

    const result = await GolferProfileModel.paginate(filter, {
      ...paginateOptions,
      populate: [
        { path: "clubMemberships", select: "name description" },
        { path: "friends", select: "fullName profileImage" },
      ],
    });

    return PaginationHelper.formatResponse(result);
  }

  /**
   * Search nearby golfers using geospatial query
   */

  async searchNearbyGolfers(searchParams: NearbyGolferSearch) {
    const { latitude, longitude, radius, page = 1, limit = 10 } = searchParams;

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: {
            isProfilePublic: true,
            location: { $exists: true },
          },
        },
      },
      {
        $lookup: {
          from: "clubs",
          localField: "clubMemberships",
          foreignField: "_id",
          as: "clubMemberships",
          pipeline: [{ $project: { name: 1, description: 1 } }],
        },
      },
      {
        $addFields: {
          distanceInKm: { $divide: ["$distance", 1000] },
        },
      },
      {
        $sort: { distance: 1 },
      },
    ];

    const options = {
      page,
      limit,
      customLabels: PaginationHelper.formatResponse({} as any).pagination,
    };

    const result = await GolferProfileModel.aggregatePaginate(
      pipeline,
      options,
    );

    return PaginationHelper.formatResponse(result);
  }
}
