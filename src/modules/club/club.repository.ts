import mongoose from "mongoose";

import { logger } from "@/middlewares/pino-logger";
import { NotFoundException } from "@/utils/app-error.utils";

import UserModel from "../user/user.model";
import ClubModel from "./club.model";

export class ClubRepository {
  async findClubByUserId(userId: string) {
    return await ClubModel.findOne({ userId }).lean();
  }

  // async findClubByUserId(userId: string) {
  //   return await ClubModel.findOne({ userId }).populate("userId", "fullName").lean();
  // }

  async updateInDB(profileId: string, updateData: any) {
    const profile = await ClubModel.findByIdAndUpdate(
      profileId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!profile) {
      throw new NotFoundException("Club profile not found");
    }

    return profile;
  }

    async updateClubInDB(userId: string, updateData: any) {
      logger.info({userId,updateData},"clubrepo.updateclubindb")
    const profile = await ClubModel.findOneAndUpdate(
      {userId},
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!profile) {
      throw new NotFoundException("Club profile not found");
    }

    return profile;
  }

  async getAllClubs() {
    const clubs = await UserModel.find({ role: "golf_cub" }).populate("club").lean();
    return clubs;
  }

  findClubById(clubId: string) {
    const club = ClubModel.findById(clubId).lean();
    return club;
  }

  assignClubManager = async (clubId: string, managerId: string) => {
    logger.info({clubId,managerId},"clubrepo.assignClubManager")
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      throw new Error("Invalid clubId");
    }

    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw new Error("Invalid managerId");
    }

    const club = await ClubModel.findOne({ userId: clubId });
    if (!club) {
      throw new Error("Club not found");
    }

    // Optional: prevent reassigning
    if (club.manager) {
      throw new Error("Manager already assigned to this club");
    }

    const manager = await UserModel.findById(managerId);
    if (!manager) {
      throw new Error("Manager user not found");
    }

    const updatedClub = await ClubModel.findOneAndUpdate(
      { userId: clubId },
      { manager: managerId },
      { new: true },
    ).populate("manager", "fullName email");

    return updatedClub;
  };
}

export const clubRepository = new ClubRepository();
