import type { NextFunction, Request, Response } from "express";

import { logger } from "@/middlewares/pino-logger";

import { friendService } from "./friends.service";

class FriendController {
  async addFriend(req: Request, res: Response, _next: NextFunction) {
    const { receiverId } = req.body;
    const userId = req.user!.userId;
    const friendship = {
      requesterId: userId,
      receiverId,
    };
    // logger.info(friendship, "from controller");
    const data = await friendService.createFriendship(friendship);
    // logger.info(data, "from controller");
    res.status(200).json({
      success: true,
      data,
      message: "Friend request sent successfully",
    });
  }

  async acceptFriendRequest(req: Request, res: Response, _next: NextFunction) {
    // logger.info(req.body, "from controller");
    const { requesterId } = req.body;
    // logger.info(requesterId, "from controller");
    const userId = req.user!.userId;
    const friendship = {
      requesterId,
      receiverId: userId,
    };
    // logger.info(friendship, "from accept controller");
    const data = await friendService.acceptFriendship(friendship);
    // logger.info(data, "from accept controller");
    res.status(200).json({
      success: true,
      data,
      message: "Friend request accepted successfully",
    });
  }

  async rejectFriendRequest(req: Request, res: Response, _next: NextFunction) {
    const { requesterId } = req.body;
    const userId = req.user!.userId;
    const friendship = {
      requesterId,
      receiverId: userId,
    };
    // logger.info(friendship, "from controller");
    const data = await friendService.rejectFriendship(friendship);
    // logger.info(data, "from controller");
    res.status(200).json({
      success: true,
      data,
      message: "Friend request rejected successfully",
    });
  }

  async getMyFriendRequests(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const friendship = {
      receiverId: userId,
    };
    const data = await friendService.getMyFriendShips(friendship);
    res.status(200).json(data);
  }

  async getMySentRequest(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const friendship = {
      requesterId: userId,
    };
    const data = await friendService.getMyFriendShips(friendship);
    res.status(200).json(data);
  }
}

export const friendController = new FriendController();
