import ClubModel from "./club.model";

export class ClubRepository {
  async findClubById(clubId: string) {
    return await ClubModel.findOne({ userId: clubId }).lean();
  }
}

export const clubRepository = new ClubRepository();
