import MembershipModel from "./memberships.model";

class MembershipRepository {
  async createMembership(data) {
    const membership = await MembershipModel.create(data);
    return membership;
  }

  async deactivateMembership(data) {
    const membership = await MembershipModel.findOneAndUpdate(
      { clubId: data.clubId, userId: data.userId },
      { isActive: false },
      { new: true },
    );
    return membership;
  }

  async  reactivateMembership(clubId: string, userId: string) {
  const membership = await MembershipModel.findOneAndUpdate(
    { clubId, userId },
    { isActive: true },
    { new: true }
  );
  return membership;
}


  async  removeMembership(clubId: string, userId: string) {
  const result = await MembershipModel.deleteOne({ clubId, userId });
  return result.deletedCount > 0;
}


  async getAllMembersOfaClub(clubId: string) {
    const members = await MembershipModel.find({ clubId }).lean();
    return members;
  }

  async getAllClubsOfaGolfer(userId: string) {
    const clubs = await MembershipModel.find({ userId }).lean();
    return clubs;
  }
}

export const membershipRepository = new MembershipRepository();
