import { authRepository } from "@/modules/auth/auth.repository";
import { BadRequestException, NotFoundException } from "@/utils/app-error.utils";
import { uploadFileToS3 } from "@/utils/file-upload.utils";

import type {
  CreateGolferProfileRequest,
  UpdateGolferProfileRequest,
} from "./golfer.type";

import { golferProfileRepository } from "./golfer.repository";

export class GolferProfileService {
  async createProfile(userId: string, profileData: CreateGolferProfileRequest["body"]) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundException("User not found");
    if (user.role !== "golfer") throw new BadRequestException("Only golfers can create a golfer profile");

    const existingProfile = await golferProfileRepository.findByUserId(userId);
    if (existingProfile) throw new BadRequestException("Golfer profile already exists for this user");

    const profile = await golferProfileRepository.createProfile(userId, profileData);

    return {
      success: true,
      data: profile,
      message: "Golfer profile created successfully",
    };
  }

  async updateProfile(
    userId: string,
    profileData: UpdateGolferProfileRequest["body"],
    files: { [fieldname: string]: Express.Multer.File[] } = {}
  ) {
    const profile = await golferProfileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException("Golfer profile not found");

    // Handle profilePicture
    if (files.profilePicture && files.profilePicture[0]) {
      const profilePicUrl = await uploadFileToS3(files.profilePicture[0].path, "uploads/");
      (profileData as any).profilePicture = profilePicUrl;
    }

    // Handle coverPhoto
    if (files.coverPhoto && files.coverPhoto[0]) {
      const coverPhotoUrl = await uploadFileToS3(files.coverPhoto[0].path, "uploads/");
      (profileData as any).coverPhoto = coverPhotoUrl;
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