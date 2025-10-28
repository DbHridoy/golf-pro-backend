import { logger } from "@/middlewares/pino-logger";

import FriendModel from "./friends.model";

class FriendRepository {
  async findFriendship(data) {
    return await FriendModel.findOne(data);
  }

  async createFriendRequest(data) {
    // const friendship = await this.findFriendship(data);
    // if (friendship)
    //   return friendship;
    const friend = new FriendModel(data);
    return friend.save();
  }

  async acceptFriendRequest(data) {
    logger.info(data, "from repository");
    const updatedFriendship = await FriendModel.findOneAndUpdate({ receiverId: data.receiverId, requesterId: data.requesterId }, { status: data.status }, { new: true });
    logger.info(updatedFriendship, "from repository upated");
    return updatedFriendship.save();
  }

  async rejectFriendRequest(data) {
    logger.info(data, "from repository");
    const updatedFriendship = await FriendModel.findOneAndUpdate({ receiverId: data.receiverId, requesterId: data.requesterId }, { status: data.status }, { new: true });
    logger.info(updatedFriendship, "from repository upated");
    return updatedFriendship.save();
  }

  getAllFriendships() {
    return FriendModel.find();
  }
}

export const friendRepository = new FriendRepository();
