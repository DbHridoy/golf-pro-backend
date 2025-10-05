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

// Authenticated routes (requires login)
// router.post(
//   "/create-profile",
//   authMiddleware.authenticate,
//   authMiddleware.authorize(["golfer"]),
//   golferProfileController.createProfile,
// );

router.put(
  "/update-profile",
  authMiddleware.authenticate,
  authMiddleware.authorize(["golfer"]),
  uploader.fields(fields),
  golferProfileController.updateProfile,
);

export default router;
