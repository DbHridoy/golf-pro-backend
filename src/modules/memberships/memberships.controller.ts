import { HTTPSTATUS } from "@/config/http.config";
import { logger } from "@/middlewares/pino-logger";

import { membershipService } from "./memberships.service";

class MembershipController {
  // golfer send the request
  async sendMembershipRequest(req: any, res: any) {
    const { userId } = req.user!;
    const clubId = req.body.clubId;
    const result = await membershipService.sendMembershipRequest({userId, clubId });
    return res.status(HTTPSTATUS.CREATED).json(result);
  }

  // get all requests
  async getMembershipRequests(req: any, res: any) {
    const { userId } = req.user!;
    const result = await membershipService.getMembershipRequests(userId);
    return res.status(HTTPSTATUS.OK).json(result);
  }

  async createMembership(req: any, res: any) {
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

  async getAllMembersOfaClub(req: any, res: any) {
    const { userId } = req.user!;
    const result = await membershipService.getAllMembersOfaClub(userId);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All members of a club",
      data: result,
    });
  }
  async approveMembershipRequest(req: any, res: any) {
    const { golferId } = req.body!;
    logger.info(`golferId from controller: ${golferId}`);
    const result = await membershipService.approveMembershipRequest( golferId );
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Membership request approved successfully",
      data: result,
    });
  }
  async rejectMembershipRequest(req: any, res: any) {
    const { golferId } = req.body!;
    logger.info(`golferId from controller: ${golferId}`);
    const result = await membershipService.rejectMembershipRequest(golferId);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Membership request rejected successfully",
      data: result,
    });
  }
}
export const membershipController = new MembershipController();
