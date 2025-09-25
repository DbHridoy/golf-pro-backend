import { authRepository } from "@/modules/auth/auth.repository";
import { BadRequestException, NotFoundException } from "@/utils/app-error.utils";

import type {
  CreateGolferProfileRequest,
  GetGolferProfilesRequest,
  GolferProfileFilters,
  LocationInput,
  NearbyGolferSearch,
  UpdateGolferProfileRequest,
} from "./golfer.type";

import { golferProfileRepository } from "./golfer.repository";

export class GolferProfileService {
  /**
   * Create golfer profile
   */
  async createProfile(userId: string, profileData: CreateGolferProfileRequest["body"]) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role !== "golfer") {
      throw new BadRequestException("Only golfers can create a golfer profile");
    }

    // Check if profile already exists
    const existingProfile = await golferProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new BadRequestException("Golfer profile already exists for this user");
    }

    // Create profile
    const profile = await golferProfileRepository.createProfile(userId, profileData);

    return {
      success: true,
      data: profile,
      message: "Golfer profile created successfully",
    };
  }

  async updateProfile(userId: string, profileData: UpdateGolferProfileRequest["body"]) {
    const profile = await golferProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }

    const updatedProfile = await golferProfileRepository.updateProfile(profile._id as string, profileData);

    return {
      success: true,
      data: updatedProfile,
      message: "Golfer profile updated successfully",
    };
  }
}

export const golferProfileService = new GolferProfileService();
