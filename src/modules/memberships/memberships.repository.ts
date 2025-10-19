import { logger } from "@/middlewares/pino-logger";

import MembershipModel from "./memberships.model";

class MembershipRepository {
  async sendMembershipRequest(data: any) {
    const existing = await MembershipModel.findOne({ clubId: data.clubId, golferId: data.golferId });
    if (existing) {
      return { success: false, message: "Golfer is already a member of this club" };
    }
    const membership = await MembershipModel.create(data);
    return membership;
  }
async getMembershipRequests(userId: string){
  const requests = await MembershipModel.find({ requestStatus: "pending", clubId: userId }).lean();
  return requests;
}
  async createMembership(data: any) {
    const existing = await MembershipModel.findOne({ clubId: data.clubId, golferId: data.golferId });
    if (existing) {
      return { success: false, message: "Golfer is already a member of this club" };
    }
    logger.info(`membership from repo: ${JSON.stringify(data)}`);
    const membership = await MembershipModel.create(data);
    logger.info(`membership from repo: ${JSON.stringify(membership)}`);
    return membership;
  }

  async getAllClubsOfaGolfer(userId: string) {
    const clubs = await MembershipModel.find({ userId }).lean();
    return clubs;
  }

  async getAllMembersOfaClub(clubId: string) {
    const members = await MembershipModel.find({ clubId }).lean();
    logger.info(`members from repo: ${JSON.stringify(members)}`);
    return members;
  }

  async deactivateMembership(data: any) {
    const membership = await MembershipModel.findOneAndUpdate(
      { clubId: data.clubId, userId: data.userId },
      { isActive: false },
      { new: true },
    );
    return membership;
  }

  async reactivateMembership(clubId: string, userId: string) {
    const membership = await MembershipModel.findOneAndUpdate(
      { clubId, userId },
      { isActive: true },
      { new: true },
    );
    return membership;
  }

  async removeMembership(clubId: string, userId: string) {
    const result = await MembershipModel.deleteOne({ clubId, userId });
    return result.deletedCount > 0;
  }
}

export const membershipRepository = new MembershipRepository();
