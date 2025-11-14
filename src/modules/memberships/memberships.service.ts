import { logger } from "@/middlewares/pino-logger";

import { clubRepository } from "../club/club.repository";
import { golferRepository } from "../golfer/golfer.repository";
import { membershipRepository } from "./memberships.repository";

class MembershipService {
  async sendMembershipRequest({userId, clubId }: any) {
    const golfer=await golferRepository.findGolferByUserId(userId);
    const golferId=golfer._id;
    const club=await clubRepository.findClubById(clubId);
    if (!club) {
      return { success: false, message: "Club not found" };
    }
    if (!golfer) {
      return { success: false, message: "Golfer not found" };
    }
    return await membershipRepository.sendMembershipRequest({ golferId, clubId });
  }

  async getMembershipRequests(userId: string) {
    const club=await clubRepository.findClubById(userId);
    const clubId=club._id;
    if (!clubId) {
      return { success: false, message: "Club not found" };
    }
    return await membershipRepository.getMembershipRequests(clubId);
  }

  async createMembership({ userId, golferId }: any) {
    logger.info(`into service layer`);
    const club = await clubRepository.findClubByUserId(userId);
    const clubId=club._id;
    if (!club) {
      return { success: false, message: "Club not found" };
    }

    // logger.info(`from membership service: ${JSON.stringify(clubId)}`);

    const golfer = await golferRepository.findGolferByUserId(golferId);
    logger.info(`golfer from membership service: ${JSON.stringify(golfer)}`);
    if (!golfer) {
      return { success: false, message: "Golfer not found" };
    }

    const data = { clubId: club._id, golferId: golfer._id, isActive: true };
    logger.info(`from membership service: ${JSON.stringify(data)}`);
    const result = membershipRepository.createMembership(data);
    return result;
  }

  async getAllClubsOfaGolfer(userId: string) {
    return await membershipRepository.getAllClubsOfaGolfer(userId);
  }

  async getAllMembersOfaClub(userId: string) {
    const club = await clubRepository.findClubByUserId(userId);
    if (!club)
      return { success: false, message: "Club not found" };
    logger.info(`from memberservice club= ${JSON.stringify(club)}`);
    return await membershipRepository.getAllMembersOfaClub(club._id);
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
  getAllMembersOfClub(clubId: string) {
    return membershipRepository.getAllMembersOfClub(clubId);
  }
}

export const membershipService = new MembershipService();
