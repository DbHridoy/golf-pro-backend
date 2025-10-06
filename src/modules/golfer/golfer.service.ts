import { logger } from "@/middlewares/pino-logger";
import {  NotFoundException } from "@/utils/app-error.utils";
import { getFilePath } from "@/utils/file-upload.utils";

import type { IGolferProfile } from "./golfer.interface";
import type {
  UpdateGolferProfileRequest,
} from "./golfer.type";

import { golferProfileRepository } from "./golfer.repository";

class GolferProfileService {
  // async createProfile(userId: string, profileData: CreateGolferProfileRequest["body"]) {
  //   const user = await authRepository.findUserById(userId);
  //   if (!user) throw new NotFoundException("User not found");
  //   if (user.role !== "golfer") throw new BadRequestException("Only golfers can create a golfer profile");

  //   const existingProfile = await golferProfileRepository.findByUserId(userId);
  //   if (existingProfile) throw new BadRequestException("Golfer profile already exists for this user");

  //   const profile = await golferProfileRepository.createProfile(userId, profileData);

  //   return {
  //     success: true,
  //     data: profile,
  //     message: "Golfer profile created successfully",
  //   };
  // }

  async updateProfile(
    userId: string,
    profileData: UpdateGolferProfileRequest["body"],
    files: { [fieldname: string]: Express.Multer.File[] } = {},
  ) {
    logger.info(profileData, "Updating profile from service");
    const profile = await golferProfileRepository.findByUserId(userId);
    logger.info(profile, "profile from service");
    if (!profile)
      throw new NotFoundException("Golfer profile not found");

    // const updatedData={...profileData}
    // Handle profilePicture

    // if (files.profilePicture?.[0]) {
    //   updatedData.profileImage = getFilePath(files.profilePicture[0].filename);
    // }
    // if (files.profilePicture && files.profilePicture[0]) {
    // const profilePicUrl = await uploadFileToS3(files.profilePicture[0].path, "uploads/");
    // const profilePicUrl = getFilePath(files.profilePicture[0].filename);
    // console.error(profilePicUrl);
    // (updatedData as any).profileImage = profilePicUrl;
    // }

    // Handle coverPhoto
    //     if (files.coverPhoto?.[0]) {
    //   updatedData.coverImage = getFilePath(files.coverPhoto[0].filename);
    // }
    // if (files.coverPhoto && files.coverPhoto[0]) {
    //   // const coverPhotoUrl = await uploadFileToS3(files.coverPhoto[0].path, "uploads/");
    //   const coverPhotoUrl = getFilePath(files.coverPhoto[0].filename);

    //   (updatedData as any).coverImage = coverPhotoUrl;
    // }
    //     const updatedData: Partial<IGolferProfile> = {
    //   ...profileData,
    //   ...(files.profilePicture?.[0] && { profileImage: getFilePath(files.profilePicture[0].filename) }),
    //   ...(files.coverPhoto?.[0] && { coverImage: getFilePath(files.coverPhoto[0].filename) }),
    // };

    // const updatedData={...profileData, profileImage: profileData.profileImage, coverImage: profileData.coverImage};

    const updatedData: Partial<IGolferProfile> = {
      fullName: profileData.fullName,
      profileImage: files.profileImage?.[0] ? getFilePath(files.profileImage[0].filename) : undefined,
      coverImage: files.coverImage?.[0] ? getFilePath(files.coverImage[0].filename) : undefined,
    };
    const updatedProfile = await golferProfileRepository.updateInDB(profile._id as string, updatedData);

    return {
      success: true,
      data: updatedProfile,
      message: "Golfer profile updated successfully",
    };
  }

  async getSingleGolferProfile(golferId: string) {
    const profile = await golferProfileRepository.findGolferById(golferId);
    if (!profile) {
      throw new NotFoundException("Golfer profile not found");
    }
    else {
      return ({
        success: true,
        data: profile,
        message: "Golfer profile fetched successfully",
      });
    }
  }
  async getAllProfiles() {
    const profiles = await golferProfileRepository.getAllGolfers();
    if (!profiles) {
      throw new NotFoundException("Golfer profiles not found");
    }
    else {
      return ({
        success: true,
        data: profiles,
        message: "Golfer profiles fetched successfully",
      });
    }
  }
}

export const golferProfileService = new GolferProfileService();
