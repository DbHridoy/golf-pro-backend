import { HTTPSTATUS } from "@/config/http.config";
import { logger } from "@/middlewares/pino-logger";

import { clubRepository } from "../club/club.repository";
import { membershipService } from "./memberships.service";

class MembershipController {
  async createMembership(req, res) {
    const { userId } = req.user!;
    const { golferId } = req.body!;
    const result = await membershipService.createMembership({ userId, golferId });
    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Membership created successfully",
      data: result,
    });
  }

  async getAllClubsOfaGolfer(req, res) {
    const { userId } = req.user!;
    const result = await membershipService.getAllClubsOfaGolfer(userId);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All clubs of a golfer",
      data: result,
    });
  }

  async getAllMembersOfaClub(req, res) {
    logger.info(`from membership controller`);
    const { userId } = req.user!;
    logger.info(`userId from controller: ${userId}`);
    const result = await membershipService.getAllMembersOfaClub(userId);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All members of a club",
      data: result,
    });
  }
}
export const membershipController = new MembershipController();
