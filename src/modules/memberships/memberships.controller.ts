import { HTTPSTATUS } from "@/config/http.config";

import { membershipService } from "./memberships.service";

class MembershipController {
  createMembership(req, res) {
    const data = req.body;
    const result = membershipService.createMembership(data);
    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Membership created successfully",
      data: result,
    });
  }

  getAllMembersOfaClub(req, res) {
    const { id } = req.params;
    const result = membershipService.getAllMembersOfaClub(id);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All members of a club",
      data: result,
    });
  }

  getAllClubsOfaGolfer(req, res) {
    const { id } = req.params;
    const result = membershipService.getAllClubsOfaGolfer(id);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All clubs of a golfer",
      data: result,
    });
  }
}
export const membershipController = new MembershipController();
