// conversation.route.ts
import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { conversationController } from "./conversation.controller";

const router = Router();
router.post(
  "/create-private",
  authMiddleware.authenticate,
  conversationController.createPrivate
);
router.post(
  "/create-channel",
  authMiddleware.authenticate,
  conversationController.createChannel
);

// for admin
router.get(
  "/get-channels",
  authMiddleware.authenticate,
  conversationController.getAllChannels
);

// for user
router.get(
  "/my-conversation",
  authMiddleware.authenticate,
  conversationController.listMine
);

router.get(
  "/get-channel-stats",
  authMiddleware.authenticate,
  conversationController.getChannelStats
);

export default router;
