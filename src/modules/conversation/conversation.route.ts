// conversation.route.ts
import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { conversationController } from "./conversation.controller";

const router = Router();

router.post("/private", authMiddleware.authenticate, conversationController.createPrivate);
router.post("/create-channel", authMiddleware.authenticate, conversationController.createChannel);
router.get ("/my", authMiddleware.authenticate, conversationController.listMine);

export default router;
