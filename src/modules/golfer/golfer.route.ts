import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
// import { createFileUploader } from "@/utils/file-upload.utils";

import { golferProfileController } from "./golfer.controller";
import { golferProfileService } from "./golfer.service";
import { logger } from "@/middlewares/pino-logger";

const router: Router = Router();
// const upload = multer({ dest: "tmp/" });
// const uploader = createFileUploader();

// Define fields with separate keys
// const fields = [
//   { name: "profileImage", maxCount: 1 },
//   { name: "coverImage", maxCount: 1 },
// ];

// router.patch(
//   "/update-golfer-profile",
//   authMiddleware.authenticate,
//   authMiddleware.authorize(["golfer"]),
//   uploader.fields(fields),
//   golferProfileController.updateProfile,
// );
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
// src/routes/upload.route.ts

router.patch("/upload", upload.any(), async (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    logger.info(`got files from route`);
    const files = req.files as Express.Multer.File[];
    const uploadedFiles = [];

    for (const file of files) {
      const key = `uploads/${Date.now()}-${file.originalname}`;
      // Assuming uploadToS3 takes buffer instead of file path
      const url = await golferProfileService.uploadToS3(file.buffer, key, file.mimetype);
      uploadedFiles.push({ originalName: file.originalname, url });
    }

    res.json({ uploaded: uploadedFiles });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error });
  }
});

export default router;
