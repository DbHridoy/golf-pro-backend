import type { NextFunction, Request, Response } from "express";

import { logger } from "@/middlewares/pino-logger";

import { golferRepository } from "../golfer/golfer.repository";
import { friendService } from "./friends.service";

class FriendController {
  async sendFriendRequest(req: Request, res: Response, _next: NextFunction) {
    // get golfer id the request will be sent to
    const { receiverId } = req.body;
    // get user id of the current user
    const userId = req.user!.userId;
    // get golfer id of the current user
    const golfer = await golferRepository.findGolferById(userId);
    logger.info(`golfer from friendt controller: ${JSON.stringify(golfer)}`);
    // create a document
    const friendship = {
      requesterId: golfer._id,
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
      }
      catch (error) {
        logger.error("Failed to send friend request notification:", error);
      }
    }
  }

  async acceptFriendRequest(req: Request, res: Response, _next: NextFunction) {
    // logger.info(req.body, "from controller");
    const { requesterId } = req.body;
    // logger.info(requesterId, "from controller");
    const userId = req.user!.userId;
    const golfer = await golferRepository.findGolferById(userId);
    const friendship = {
      requesterId,
      receiverId: golfer._id,
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
    const golfer = await golferRepository.findGolferById(userId);
    const friendship = {
      requesterId,
      receiverId: golfer._id,
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
    const golfer = await golferRepository.findGolferById(userId);
    const friendship = {
      receiverId: golfer._id,
    };
    const data = await friendService.getMyRequests(friendship);
    res.status(200).json(data);
  }

  async getMySentRequest(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const golfer = await golferRepository.findGolferById(userId);
    const friendship = {
      requesterId: golfer._id,
    };
    const data = await friendService.getMySentRequest(friendship);
    res.status(200).json(data);
  }

  async getMyFriends(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const golfer = await golferRepository.findGolferById(userId);
    friendService.getMyFriends(golfer._id).then(data => res.status(200).json(data));
  }
  async getAllFriendships(req: Request, res: Response, _next: NextFunction) {
    friendService.getAllFriendships().then(data => res.status(200).json(data));
  }
}

export const friendController = new FriendController();
