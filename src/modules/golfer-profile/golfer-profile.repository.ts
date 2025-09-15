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
}
