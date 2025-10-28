import { logger } from "@/middlewares/pino-logger";

import { notificationService } from "../notification/notification.service";
import { friendRepository } from "./friends.repository";

class FriendService {
  async createFriendRequest(data) {
    const friendship = await friendRepository.createFriendRequest(data);

    // Send notification to receiver
    try {
      await notificationService.createAndSendNotification({
        recipientId: data.receiverId,
        type: "friend_request_sent",
        title: "New Friend Request",
        body: "Someone sent you a friend request",
        payload: {
          friendRequestId: friendship._id.toString(),
          senderName: "Friend", // You'll need to get the actual sender name
        },
      });
    }
    catch (error) {
      logger.error("Failed to send friend request notification:", error);
    }

    return friendship;
  }

  async acceptFriendRequest(data) {
    const updatedData = {
      ...data,
      status: "accepted",
    };
    const friendship = await friendRepository.acceptFriendRequest(updatedData);

    // Send notification to requester
    // try {
    //   await notificationService.createAndSendNotification({
    //     recipientId: data.requesterId,
    //     type: "friend_request_accepted",
    //     title: "Friend Request Accepted",
    //     body: "Your friend request was accepted",
    //     payload: {
    //       friendRequestId: friendship._id.toString(),
    //     },
    //   });
    // }
    // catch (error) {
    //   logger.error("Failed to send friend acceptance notification:", error);
    // }

    return friendship;
  }

  async rejectFriendRequest(data) {
    const updatedData = {
      ...data,
      status: "rejected",
    };
    const friendship = await friendRepository.rejectFriendRequest(updatedData);
    // logger.info(friendship, "from service");
    return friendship;
  }

  async getMyRequests(data) {
    const friendship = await friendRepository.findFriendship(data);
    return friendship;
  }

  getMySentRequest(data) {
    const friendship = friendRepository.findFriendship(data);
    return friendship;
  }

  async getMyFriends(userId) {
    const data = await friendRepository.findFriendship({
      $or: [{ receiverId: userId }, { requesterId: userId }],
      status: "accepted",
    });

    return {
      success: true,
      data,
      message: "My friends fetched successfully",
    };
  }

  getAllFriendships() {
    return friendRepository.getAllFriendships();
  }
}

export const friendService = new FriendService();
