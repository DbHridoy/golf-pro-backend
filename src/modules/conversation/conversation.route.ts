// conversation.route.ts
import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { conversationController } from "./conversation.controller";

const router = Router();

router.post("/private", authMiddleware.authenticate, conversationController.createPrivate);
router.post("/club", authMiddleware.authenticate, conversationController.createClub);
router.get ("/my", authMiddleware.authenticate, conversationController.listMine);

export default router;
