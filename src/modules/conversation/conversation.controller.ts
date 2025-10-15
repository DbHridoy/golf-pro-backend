// conversation.controller.ts
import type { Request, Response } from "express";

import { asyncHandler } from "@/middlewares/async-handler.middleware";

import { conversationService } from "./conversation.service";

class ConversationController {
  createPrivate = asyncHandler(async (req: Request, res: Response) => {
    const conv = await conversationService.getOrCreatePrivate(
      req.user!.userId,
      req.body.userId,
    );
    res.status(201).json({ success: true, data: conv });
  });

  createClub = asyncHandler(async (req: Request, res: Response) => {
    const conv = await conversationService.createClubConversation(
      req.user!.userId,
      req.body.clubId,
      req.body.title,
    );
    res.status(201).json({ success: true, data: conv });
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    const list = await conversationService.listForUser(req.user!.userId);
    res.json({ success: true, data: list });
  });
}

export const conversationController = new ConversationController();
