import { logger } from "@/middlewares/pino-logger";

import { clubRepository } from "../club/club.repository";
import { golferRepository } from "../golfer/golfer.repository";
import { membershipRepository } from "./memberships.repository";

class MembershipService {
  async sendMembershipRequest({ golferId, clubId }: any) {
    const club = await clubRepository.findClubById(clubId);
    if (!club)
      return { success: false, message: "Club not found" };
    logger.warn({ club }, "Club from member service");
    const clubID = club.userId;
    logger.warn({ clubID }, "ClubID from member service");
    const result = await membershipRepository.sendMembershipRequest({
      golferId,
      clubId: clubID,
    });
    return result;
  }

  async getMembershipRequests(clubId: string) {
    logger.info("ClubId from service", clubId);
    const requests = await membershipRepository.getMembershipRequests(clubId);
    return requests;
  }

  async createMembership({ userId, golferId }: any) {
    logger.info(`into service layer`);
    const club = await clubRepository.findClubByUserId(userId);
    if (!club)
      return { success: false, message: "Club not found" };
    const clubId = club._id;
    if (!clubId) {
      return { success: false, message: "Club not found" };
    }

    // logger.info(`from membership service: ${JSON.stringify(clubId)}`);

    const golfer = await golferRepository.findGolferByUserId(golferId);
    logger.info(`golfer from membership service: ${JSON.stringify(golfer)}`);
    if (!golfer) {
      return { success: false, message: "Golfer not found" };
    }

    const data = { clubId, golferId: golfer._id, isActive: true };
    logger.info(`from membership service: ${JSON.stringify(data)}`);
    const result = membershipRepository.createMembership(data);
    return result;
  }

  async getAllClubsOfaGolfer(golferId: string) {
    return await membershipRepository.getAllClubsOfaGolfer(golferId);
  }

  getClubMembersById = async (clubId) => {
    const members =await membershipRepository.getClubMembersById(clubId);
    return members;
  };

  async getAllMembersOfaClub(clubId: string) {
    return await membershipRepository.getAllMembersOfaClub(clubId);
  }

  updateMembership(data) {
    return membershipRepository.deactivateMembership(data);
  }

  reactivateMembership(clubId: string, userId: string) {
    return membershipRepository.reactivateMembership(clubId, userId);
  }

  deleteMembership(clubId: string, userId: string) {
    return membershipRepository.removeMembership(clubId, userId);
  }

  approveMembershipRequest(golferId: string) {
    logger.info(`into service layer`);
    return membershipRepository.approveMembershipRequest(golferId);
  }

  rejectMembershipRequest(golferId: string) {
    logger.info(`into service layer`);
    return membershipRepository.rejectMembershipRequest(golferId);
  }
}

export const membershipService = new MembershipService();
