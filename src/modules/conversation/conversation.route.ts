// conversation.route.ts
import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { logger } from "@/middlewares/pino-logger";
import { upload } from "@/middlewares/upload.middleware";
import fileUploadUtils from "@/utils/file-upload.utils";

import { conversationController } from "./conversation.controller";

const router = Router();
router.post(
  "/create-private",
  authMiddleware.authenticate,
  conversationController.createPrivate,
);
router.post(
  "/create-channel",
  authMiddleware.authenticate,
  conversationController.createChannel,
);

// for admin
router.get(
  "/get-channels",
  authMiddleware.authenticate,
  conversationController.getAllChannels,
);

// for user
router.get(
  "/my-conversation",
  authMiddleware.authenticate,
  conversationController.listMine,
);

router.get(
  "/get-channel-stats",
  authMiddleware.authenticate,
  conversationController.getChannelStats,
);

router.post(
  "/upload-single-file",
  upload.single("file"), // simpler for single file
  async (req, res) => {
    try {
      const f = req.file; // multer puts single file here
      if (!f) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const key = `uploads/club/channel/${Date.now()}-${f.originalname}`;
      logger.info(`Uploading file to S3: ${key}`);

      const url = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
      return res.json({ url });
    }
    catch (err) {
      logger.error("File upload failed →", err);
      return res.status(500).json({ error: "File upload failed" });
    }
  },
);

export default router;
