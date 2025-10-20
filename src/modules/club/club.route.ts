import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";

import { clubController } from "./club.controller";

const router = Router();

router.get("/get-club-profile", authMiddleware.authenticate, authMiddleware.authorize(["golf_club"]), clubController.getClubProfile);
router.patch(
  "/update-club-profile",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golf_club"]),
  upload.fields([
    { name: "clubProfileImage", maxCount: 1 },
    { name: "clubCoverImage", maxCount: 1 },
  ]),
  clubController.updateProfile,
);
export default router;
