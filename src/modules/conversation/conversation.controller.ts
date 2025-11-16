// conversation.controller.ts
import type { Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";

import conversationRepository from "./conversation.repository";
import { conversationService } from "./conversation.service";

class ConversationController {
  createPrivate = asyncHandler(async (req: Request, res: Response) => {
    logger.info(
      `from conversation controller: ${req.user!.userId} ${req.body.golferId}`
    );
    const conv = await conversationService.getOrCreatePrivate(
      req.user!.userId,
      req.body.golferId
    );
    res.status(201).json({ success: true, data: conv });
  });

  createChannel = asyncHandler(async (req, res) => {
    const { body } = req;
    const channel = {
      type: "channel",
      title: body.title,
      clubId: body.clubId,
      members: body.members,
    };
    const newChannel = await conversationService.createChannel(channel);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "New channel created successfully",
      data: newChannel,
    });
  });

  createClub = asyncHandler(async (req: Request, res: Response) => {
    const conv = await conversationService.createClubConversation(
      req.user!.userId,
      req.body.club,
      req.body.title
    );
    res.status(201).json({ success: true, data: conv });
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`from conversation controller: ${req.user!.userId}`);
    const list = await conversationService.listForUser(req.user!.userId);
    res.json({ success: true, data: list });
  });

  getAllChannels = asyncHandler(async (req, res) => {
    const channels = await conversationRepository.getAllChannels();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All channels fetched successfully",
      data: channels,
    });
  });
  getChannelStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await conversationService.getChannelStats();
    res.json({ success: true, data: stats });
  });
}

export const conversationController = new ConversationController();
