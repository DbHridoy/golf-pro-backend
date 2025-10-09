import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";
import { createFileUploader } from "@/utils/file-upload.utils";

import { golferProfileController } from "./golfer.controller";

const router: Router = Router();
// const upload = multer({ dest: "tmp/" });
const uploader = createFileUploader();

// Define fields with separate keys
const fields = [
  { name: "profileImage", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
];

router.patch(
  "/update-golfer-profile",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golfer"]),
  uploader.fields(fields),
  golferProfileController.updateProfile,
);
router.get(
  "/get-golfer-profiles",
  authMiddleware.authenticate,
  authMiddleware.authorize(["admin", "golf_club", "golfer"]),
  golferProfileController.getGolferProfiles,
);
router.get(
  "/get-golfer-profile/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golfer", "golf_club", "admin"]),
  golferProfileController.getSingleGolferProfile,
);


router.patch(
  "/toggle-golfer-status/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize(["admin", "golf_club"]),
  golferProfileController.toggleGolferStatus,
);

export default router;
