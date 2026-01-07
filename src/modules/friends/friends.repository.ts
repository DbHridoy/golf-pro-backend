import { logger } from "@/middlewares/pino-logger";

import FriendModel from "./friends.model";

class FriendRepository {
  async findMyFriends(userId: string) {
    // 1. User is the receiver → friend is requester
    const received = await FriendModel.find({
      receiverId: userId,
      status: "accepted",
    }).populate("requesterId receiverId");

    // 2. User is the requester → friend is receiver
    const sent = await FriendModel.find({
      requesterId: userId,
      status: "accepted",
    }).populate("requesterId receiverId");

    const all = [...received, ...sent];

    if (all.length === 0) return [];

    // 3. Normalize
    return all.map((item) => {
      const friend =
        item.requesterId._id.toString() === userId
          ? item.receiverId
          : item.requesterId;

      return {
        friendshipId: item._id,
        friend,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  }

  async findSentRequest(userId: string) {
    // 1. Find where the user is the requester
    let data = await FriendModel.find({
      requesterId: userId,
      status: "pending",
    }).populate("receiverId requesterId");

    // 2. If none found, try where user is the receiver
    if (data.length === 0) {
      data = await FriendModel.find({
        receiverId: userId,
        status: "pending",
      }).populate("receiverId requesterId");
    }

    if (data.length === 0) return [];

    // 3. Normalize each result
    return data.map((item) => {
      const requestedUser =
        item.requesterId._id.toString() === userId
          ? item.receiverId
          : item.requesterId;

      return {
        friendshipId: item._id,
        requestedUser,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  }

  async findMyRequests(userId: string) {
    // 1. Find where the user is the receiver
    let data = await FriendModel.find({
      receiverId: userId,
      status: "pending",
    }).populate("receiverId requesterId");

    // 2. If none found, try where user is the receiver
    if (data.length === 0) {
      data = await FriendModel.find({
        receiverId: userId,
        status: "pending",
      }).populate("receiverId requesterId");
    }

    if (data.length === 0) return [];

    // 3. Normalize each result
    return data.map((item) => {
      const requestedUser =
        item.requesterId._id.toString() === userId
          ? item.receiverId
          : item.requesterId;

      return {
        friendshipId: item._id,
        requestedUser,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  }

  async createFriendRequest(data: any) {
    const friend = new FriendModel(data);
    return friend.save();
  }

  async acceptFriendRequest(data: any) {
    logger.info(data, "from repository");
    const updatedFriendship = await FriendModel.findOneAndUpdate(
      { receiverId: data.receiverId, requesterId: data.requesterId },
      { status: data.status },
      { new: true }
    );
    logger.info(updatedFriendship, "from repository upated");
    return updatedFriendship.save();
  }

  async rejectFriendRequest(data: any) {
    logger.info(data, "from repository");
    const updatedFriendship = await FriendModel.findOneAndUpdate(
      { receiverId: data.receiverId, requesterId: data.requesterId },
      { status: data.status },
      { new: true }
    );
    logger.info(updatedFriendship, "from repository upated");
    return updatedFriendship.save();
  }

  async cancelFriendRequest(data: any) {
    logger.info(data, "from cancel repository");
    const friendship = await FriendModel.findOneAndUpdate(
      { receiverId: data.receiverId, requesterId: data.requesterId },
      { status: data.status },
      { new: true }
    );
    // logger.info(friendship, "from repository upated");
    return friendship;
  }

  getAllFriendships(): Promise<any> {
    return FriendModel.find().populate("receiverId").populate("requesterId");
  }
}

export const friendRepository = new FriendRepository();
