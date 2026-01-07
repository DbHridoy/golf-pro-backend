import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { membershipController } from "./memberships.controller";

const router = Router();

router.post("/send-membership-request", authMiddleware.authenticate, authMiddleware.authorize(["golfer"]), membershipController.sendMembershipRequest);

router.get("/get-membership-requests", authMiddleware.authenticate, authMiddleware.authorize(["golf_club"]), membershipController.getMembershipRequests);
router.get("/get-my-clubs", authMiddleware.authenticate, authMiddleware.authorize(["golfer"]), membershipController.getAllClubsOfaGolfer);
router.get("/get-my-members", authMiddleware.authenticate, authMiddleware.authorize(["golf_club"]), membershipController.getAllMembersOfaClub);
router.get("/get-members/:clubId",membershipController.getClubMembersById)

router.patch("/approve-membership-request", authMiddleware.authenticate, authMiddleware.authorize(["golf_club"]), membershipController.approveMembershipRequest);
router.patch("/reject-membership-request", authMiddleware.authenticate, authMiddleware.authorize(["golf_club"]), membershipController.rejectMembershipRequest);
// router.patch("/update-membership/:id", );
// router.delete("/delete-membership/:id", );

export default router;
