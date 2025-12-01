import type { NextFunction, Request, Response } from "express";

import { logger } from "@/middlewares/pino-logger";

import { golferRepository } from "../golfer/golfer.repository";
import { friendService } from "./friends.service";

class FriendController {
  async sendFriendRequest(req: Request, res: Response, _next: NextFunction) {
    // get userid of the golfer
    const { receiverId } = req.body;
    // get user id of the current user
    const userId = req.user!.userId;
    // create a document
    const friendship = {
      requesterId: userId,
      receiverId,
    };
    // create a friend request
    const data = await friendService.createFriendRequest(friendship);

    // logger.info(data, "from controller");
    if (data) {
      // Send notification to receiver
      try {
        res.status(200).json({
          success: true,
          data,
          message: "Friend request sent successfully",
        });
      } catch (error) {
        logger.error("Failed to send friend request notification:", error);
      }
    }
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
    logger.info(`from accept controller: ${JSON.stringify(friendship)}`);
    const data = await friendService.acceptFriendRequest(friendship);
    // logger.info(data, "from accept controller");
    res.status(200).json({
      success: true,
      data,
      message: "Friend request accepted successfully",
    });
  }

  async rejectFriendRequest(req: Request, res: Response, _next: NextFunction) {
    // logger.info(req.body, "from controller");
    const { requesterId } = req.body;
    // logger.info(requesterId, "from controller");
    const userId = req.user!.userId;
    const friendship = {
      requesterId,
      receiverId: userId,
    };
    // logger.info(friendship, "from controller");
    const data = await friendService.rejectFriendRequest(friendship);
    // logger.info(data, "from controller");
    res.status(200).json({
      success: true,
      data,
      message: "Friend request rejected successfully",
    });
  }

  async getMyRequests(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const friendship = {
      receiverId: userId,
    };
    const data = await friendService.getMyRequests(friendship);
    res.status(200).json(data);
  }

  async getMySentRequest(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const data = await friendService.getMySentRequest(userId);
    res.status(200).json(data);
  }

  async getMyFriends(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    friendService.getMyFriends(userId).then((data) => res.status(200).json(data));
  }

  async getAllFriendships(req: Request, res: Response, _next: NextFunction) {
    friendService
      .getAllFriendships()
      .then((data) => res.status(200).json(data));
  }

  async cancelFriendRequest(req: Request, res: Response, _next: NextFunction) {
    const { receiverId } = req.body;
    const userId = req.user!.userId;
    const friendship = {
      requesterId: userId,
      receiverId,
    };
    friendService.cancelFriendRequest(friendship).then((data) =>
      res.status(200).json({
        success: true,
        data,
        message: "Friend request cancelled and deleted successfully",
      })
    );
  }
}

export const friendController = new FriendController();
