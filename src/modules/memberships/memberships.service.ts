import { logger } from "@/middlewares/pino-logger";

import { clubRepository } from "../club/club.repository";
import { golferRepository } from "../golfer/golfer.repository";
import { membershipRepository } from "./memberships.repository";

class MembershipService {
  async sendMembershipRequest({ golferId, clubId }: any) {
    return membershipRepository.sendMembershipRequest({ golferId, clubId });
  }
async getMembershipRequests(userId: string) {
    return membershipRepository.getMembershipRequests(userId);
  }
  async createMembership({ userId, golferId }: any) {
    logger.info(`into service layer`);
    const club = await clubRepository.findClubById(userId);
    if (!club) {
      return { success: false, message: "Club not found" };
    }

    // logger.info(`from membership service: ${JSON.stringify(clubId)}`);

    const golfer = await golferRepository.findByUserId(golferId);
    logger.info(`golfer from membership service: ${JSON.stringify(golfer)}`);
    if (!golfer) {
      return { success: false, message: "Golfer not found" };
    }

    const data = { clubId: club._id, golferId: golfer._id, isActive: true };
    logger.info(`from membership service: ${JSON.stringify(data)}`);
    const result = membershipRepository.createMembership(data);
    return result;
  }

  getAllClubsOfaGolfer(userId: string) {
    return membershipRepository.getAllClubsOfaGolfer(userId);
  }

  getAllMembersOfaClub(userId: string) {
    const club = clubRepository.findClubById(userId);
    if (!club)
      return { success: false, message: "Club not found" };
    logger.info(`from memberservice club= ${JSON.stringify(club)}`);
    return membershipRepository.getAllMembersOfaClub(club._id);
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
}

export const membershipService = new MembershipService();
