import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "node:process";

import { bucket, s3 } from "@/config/aws.config";
import { NotFoundException } from "@/utils/app-error.utils";
import fileUploadUtils from "@/utils/file-upload.utils";

import type { IGolferProfile } from "./golfer.interface";
import type {
  UpdateGolferProfileRequest,
} from "./golfer.type";

import { golferRepository } from "./golfer.repository";

class GolferService {
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
  
  getMyProfile(userId) {
    const profile = golferRepository.findGolferByUserId(userId);
    return profile;
  }

  async updateProfile(
    userId: string,
    body: UpdateGolferProfileRequest["body"],
    files: { [fieldname: string]: Express.Multer.File[] } = {},
  ) {
    const existing = await golferRepository.findGolferByUserId(userId);
    if (!existing)
      throw new NotFoundException("Golfer profile not found");

    const update: Partial<IGolferProfile> = { ...body };

    // profile image
    if (files.profileImage?.[0]) {
      const f = files.profileImage[0];
      const key = `uploads/golfers/${userId}/profile-${Date.now()}-${f.originalname}`;
      update.profileImage = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
    }

    // cover image
    if (files.coverImage?.[0]) {
      const f = files.coverImage[0];
      const key = `uploads/golfers/${userId}/cover-${Date.now()}-${f.originalname}`;
      update.coverImage = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
    }

    // strip undefined so we don’t overwrite existing fields
    Object.keys(update).forEach(k => (update as any)[k] == null && delete (update as any)[k]);

    const saved = await golferRepository.updateInDB(existing._id as string, update);

    return { success: true, data: saved, message: "Golfer profile updated successfully" };
  }

  // async updateProfile(
  //   userId: string,
  //   profileData: UpdateGolferProfileRequest["body"],
  //   files: { [fieldname: string]: Express.Multer.File[] } = {},
  // ) {
  //   // logger.info(profileData, "Updating profile from service");
  //   const profile = await golferProfileRepository.findByUserId(userId);
  //   // logger.info(profile, "profile from service");
  //   if (!profile)
  //     throw new NotFoundException("Golfer profile not found");

  //   // const updatedData={...profileData}
  //   // Handle profilePicture

  //   // if (files.profilePicture?.[0]) {
  //   //   updatedData.profileImage = getFilePath(files.profilePicture[0].filename);
  //   // }
  //   // if (files.profilePicture && files.profilePicture[0]) {
  //   // const profilePicUrl = await uploadFileToS3(files.profilePicture[0].path, "uploads/");
  //   // const profilePicUrl = getFilePath(files.profilePicture[0].filename);
  //   // console.error(profilePicUrl);
  //   // (updatedData as any).profileImage = profilePicUrl;
  //   // }

  //   // Handle coverPhoto
  //   //     if (files.coverPhoto?.[0]) {
  //   //   updatedData.coverImage = getFilePath(files.coverPhoto[0].filename);
  //   // }
  //   // if (files.coverPhoto && files.coverPhoto[0]) {
  //   //   // const coverPhotoUrl = await uploadFileToS3(files.coverPhoto[0].path, "uploads/");
  //   //   const coverPhotoUrl = getFilePath(files.coverPhoto[0].filename);

  //   //   (updatedData as any).coverImage = coverPhotoUrl;
  //   // }
  //   //     const updatedData: Partial<IGolferProfile> = {
  //   //   ...profileData,
  //   //   ...(files.profilePicture?.[0] && { profileImage: getFilePath(files.profilePicture[0].filename) }),
  //   //   ...(files.coverPhoto?.[0] && { coverImage: getFilePath(files.coverPhoto[0].filename) }),
  //   // };

  //   // const updatedData={...profileData, profileImage: profileData.profileImage, coverImage: profileData.coverImage};

  //   const updatedData = {
  //     fullName: profileData.fullName,
  //     profileImage: files.profileImage?.[0] ? getFilePath(files.profileImage[0].filename) : undefined,
  //     coverImage: files.coverImage?.[0] ? getFilePath(files.coverImage[0].filename) : undefined,
  //   };

  //   const updatedProfile = await golferProfileRepository.updateInDB(profile._id as string, updatedData);

  //   return {
  //     success: true,
  //     data: updatedProfile,
  //     message: "Golfer profile updated successfully",
  //   };
  // }

  // src/services/s3.service.ts

  // uploadToS3 = async (fileContent: Buffer, key: string, contentType: string) => {
  //   await s3.send(
  //     new PutObjectCommand({
  //       Bucket: bucket,
  //       Key: key,
  //       Body: fileContent,
  //       ContentType: contentType,
  //       ACL: "public-read",
  //     }),
  //   );

  //   return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  // };
}

export const golferService = new GolferService();
