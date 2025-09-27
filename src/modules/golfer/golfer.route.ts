import { Router } from "express";
import multer from "multer";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { golferProfileController } from "./golfer.controller";

const router: Router = Router();
const upload = multer({ dest: "tmp/" });

// Authenticated routes (requires login)
router.post(
  "/create-profile",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golfer", "system_admin"]),
  golferProfileController.createProfile,
);

router.put(
  "/update-profile",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golfer"]),
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  golferProfileController.updateProfile,
);

export default router;
