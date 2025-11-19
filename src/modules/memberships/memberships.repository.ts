import { logger } from "@/middlewares/pino-logger";

import MembershipModel from "./memberships.model";

class MembershipRepository {
  // save the membership request
  async sendMembershipRequest({ golferId, clubId }: any) {
    const existing = await MembershipModel.findOne({ clubId, golferId });
    logger.info({ existing }, "Existing membership request");
    if (existing) {
      if (existing.status === "pending") {
        return {
          success: false,
          message: "Membership request already sent",
        };
      }
      return {
        success: false,
        message: "Golfer is already a member of this club",
      };
    }
    const membership = await MembershipModel.create({ golferId, clubId });
    return {
      success: true,
      message: "Membership request sent successfully",
      data: membership,
    };
  }

  async getMembershipRequests(clubId: string) {
    logger.info("ClubId from member repo", clubId);
    const requests = await MembershipModel.find({
      status: "pending",
      clubId,
    })
      .populate("golferId", "fullName")
      .lean();
    return { success: true, message: "Membership requests", data: requests };
  }

  async createMembership(data: any) {
    const existing = await MembershipModel.findOne({
      clubId: data.clubId,
      golferId: data.golferId,
    });
    if (existing) {
      return {
        success: false,
        message: "Golfer is already a member of this club",
      };
    }
    logger.info(`membership from repo: ${JSON.stringify(data)}`);
    const membership = await MembershipModel.create(data);
    logger.info(`membership from repo: ${JSON.stringify(membership)}`);
    return {
      success: true,
      message: "Membership created successfully",
      data: membership,
    };
  }

  async getAllClubsOfaGolfer(golferId: string) {
    const clubs = await MembershipModel.find({
      golferId,
      status: "approved",
    })
      .populate("clubId", "fullName")
      .lean();
    return clubs;
  }

  async getAllMembersOfaClub(clubId: string) {
    const members = await MembershipModel.find({
      clubId,
      status: "approved",
    })
      .populate("golferId", "fullName")
      .lean();
    return members;
  }

  async deactivateMembership(data: any) {
    const membership = await MembershipModel.findOneAndUpdate(
      { clubId: data.clubId, userId: data.userId },
      { isActive: false },
      { new: true }
    );
    return membership;
  }

  async reactivateMembership(clubId: string, userId: string) {
    const membership = await MembershipModel.findOneAndUpdate(
      { clubId, userId },
      { isActive: true },
      { new: true }
    );
    return membership;
  }

  async removeMembership(clubId: string, userId: string) {
    const result = await MembershipModel.deleteOne({ clubId, userId });
    return result.deletedCount > 0;
  }

  async approveMembershipRequest(golferId: any) {
    const membership = await MembershipModel.findOneAndUpdate(
      { golferId },
      { status: "approved" },
      { new: true }
    );
    return membership;
  }

  async rejectMembershipRequest(golferId: any) {
    const membership = await MembershipModel.findOneAndUpdate(
      { golferId },
      { requestStatus: "rejected" },
      { new: true }
    );
    return membership;
  }
  async findMembersByClubId(clubId: string) {
    console.warn(clubId);
    const members = await MembershipModel.find(
      { clubId, status: "approved" },
      { golferId: 1 }
    )
      .populate("golferId", "fullName")
      .lean();
    return members;
  }
}

export const membershipRepository = new MembershipRepository();
