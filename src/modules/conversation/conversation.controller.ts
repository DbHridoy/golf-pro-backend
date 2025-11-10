// conversation.controller.ts
import type { Request, Response } from "express";

import { asyncHandler } from "@/middlewares/async-handler.middleware";

import { conversationService } from "./conversation.service";
import { title } from "process";
import { channel } from "diagnostics_channel";
import { HTTPSTATUS } from "@/config/http.config";
import { success } from "zod/v4";
import conversationRepository from "./conversation.repository";

class ConversationController {
  createPrivate = asyncHandler(async (req: Request, res: Response) => {
    const conv = await conversationService.getOrCreatePrivate(
      req.user!.userId,
      req.body.golferId
    );
    res.status(201).json({ success: true, data: conv });
  });

  createClub = asyncHandler(async (req: Request, res: Response) => {
    const conv = await conversationService.createClubConversation(
      req.user!.userId,
      req.body.clubId,
      req.body.title
    );
    res.status(201).json({ success: true, data: conv });
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    const list = await conversationService.listForUser(req.user!.userId);
    res.json({ success: true, data: list });
  });
  createChannel = asyncHandler(async (req, res) => {
    const { body } = req;
    const channel = {
      type: "channel",
      title,
      club: body.clubId,
      members: body.memberId,
    };
    const newChannel = await conversationService.createChannel(channel);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "New channel created successfully",
      data: newChannel,
    });
  });
  getAllChannels = asyncHandler(async (req, res) => {
    const channels = await conversationRepository.getAllChannels();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All channels fetched successfully",
      data: channels,
    });
  });
}

export const conversationController = new ConversationController();
