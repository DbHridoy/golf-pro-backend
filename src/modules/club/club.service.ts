import { NotFoundException } from "@/utils/app-error.utils";
import fileUploadUtils from "@/utils/file-upload.utils";

import { clubRepository } from "./club.repository";

class ClubService {
  async getClubProfile(userId: string) {
    const profile = await clubRepository.findClubByUserId(userId);
    if (!profile)
      throw new NotFoundException("Club profile not found");
    return {
      success: true,
      data: profile,
      message: "Club profile fetched successfully",
    };
  }

  async updateProfile(
    userId: string,
    body: any,
    files: { [fieldname: string]: Express.Multer.File[] } = {},
  ) {
    const existing = await clubRepository.findClubByUserId(userId);
    if (!existing)
      throw new NotFoundException("Club profile not found");

    const update = { ...body };

    // profile image
    if (files.clubProfileImage?.[0]) {
      const f = files.clubProfileImage[0];
      const key = `uploads/club/${userId}/profile-${Date.now()}-${f.originalname}`;
      update.clubProfileImage = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
    }

    // cover image
    if (files.clubCoverImage?.[0]) {
      const f = files.clubCoverImage[0];
      const key = `uploads/club/${userId}/cover-${Date.now()}-${f.originalname}`;
      update.clubCoverImage = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
    }

    // strip undefined so we don’t overwrite existing fields
    Object.keys(update).forEach(k => (update as any)[k] == null && delete (update as any)[k]);

    if (!existing) {
      throw new NotFoundException("Club profile not found");
    }

    const saved = await clubRepository.updateInDB(existing._id, update);

    return { success: true, data: saved, message: "Club profile updated successfully" };
  }
}

export const clubService = new ClubService();
