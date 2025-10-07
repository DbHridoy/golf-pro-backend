import { logger } from "@/middlewares/pino-logger";

import FriendModel from "./friends.model";

class FriendRepository {
  async findFriendship(data) {
    return await FriendModel.findOne(data);
  }

  async createFriendRequestIntoDB(data) {
    const friendship = await this.findFriendship(data);
    if (friendship)
      return friendship;
    const friend = new FriendModel(data);
    return friend.save();
  }

  async updateFriendRequestIntoDB(data) {
    // logger.info(data, "from repository");
    const updatedFriendship = await FriendModel.findOneAndUpdate({ receiverId: data.receiverId, requesterId: data.requesterId }, { status: data.status }, { new: true });
    return updatedFriendship.save();
  }
}

export const friendRepository = new FriendRepository();
