import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";

import { clubController } from "./club.controller";

const router = Router();

router.get("/get-club-profile", authMiddleware.authenticate, authMiddleware.authorize(["golf_club"]), clubController.getClubProfile);
router.get("/get-all-clubs", authMiddleware.authenticate, clubController.getAllClubs);
router.get("/get-club-profile/:clubId", authMiddleware.authenticate, clubController.getClubProfile);

router.patch(
  "/update-club-profile",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golf_club","admin"]),
  upload.fields([
    { name: "clubProfileImage", maxCount: 1 },
    { name: "clubCoverImage", maxCount: 1 },
  ]),
  clubController.updateProfile,
);
router.patch(
  "/update-club/:clubId",
  authMiddleware.authenticate,
  authMiddleware.authorize(["admin"]),
  upload.fields([
    { name: "clubProfileImage", maxCount: 1 },
    { name: "clubCoverImage", maxCount: 1 },
  ]),
  clubController.updateClub,
);
router.patch("/assign-club-manager", clubController.assignClubManager);

export default router;
