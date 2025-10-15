import { NotFoundException } from "@/utils/app-error.utils";

import ClubModel from "./club.model";

export class ClubRepository {
  async findClubById(clubId: string) {
    return await ClubModel.findOne({ userId: clubId }).lean();
  }

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
}

export const clubRepository = new ClubRepository();
