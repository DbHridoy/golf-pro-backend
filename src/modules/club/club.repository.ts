import { NotFoundException } from "@/utils/app-error.utils";

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
    )
      .lean();

    if (!profile) {
      throw new NotFoundException("Club profile not found");
    }

    return profile;
  }
  getAllClubs() {
    const clubs = ClubModel.find({}).lean();
    return clubs;
  }
}

export const clubRepository = new ClubRepository();
