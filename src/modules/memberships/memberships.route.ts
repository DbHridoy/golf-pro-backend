import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { membershipController } from "./memberships.controller";

const router = Router();

router.post("/create-membership", authMiddleware.authenticate,authMiddleware.authorize(["golf_club"]), membershipController.createMembership);
router.get("/get-myclubs",authMiddleware.authenticate,authMiddleware.authorize(["golfer"]), membershipController.getAllClubsOfaGolfer);
router.get("/get-mymembers",authMiddleware.authenticate,authMiddleware.authorize(["golf_club"]), membershipController.getAllMembersOfaClub);
// router.patch("/update-membership/:id", );
// router.delete("/delete-membership/:id", );

export default router;
