import type { NextFunction, Request, Response } from "express";

import { channelService } from "./channel.service";

class ChannelController {
  createChannel(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    const channel = channelService.createChannel(data);
    res.status(200).json({
      success: true,
      message: "Channel created successfully",
      data: channel,
    });
  }

  getChannel(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const channel = channelService.getChannel(id);
    res.status(200).json({
      success: true,
      message: "Channel fetched successfully",
      data: channel,
    });
  }

  getAllChannels(req: Request, res: Response, next: NextFunction) {
    const channels = channelService.getAllChannels();
    res.status(200).json({
      success: true,
      message: "Channels fetched successfully",
      data: channels,
    });
  }

  updateChannel(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const data = req.body;
    const channel = channelService.updateChannel(id, data);
    res.status(200).json({
      success: true,
      message: "Channel updated successfully",
      data: channel,
    });
  }

  deleteChannel(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const channel = channelService.deleteChannel(id);
    res.status(200).json({
      success: true,
      message: "Channel deleted successfully",
      data: channel,
    });
  }
}

export const channelController = new ChannelController();
