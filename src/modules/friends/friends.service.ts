import { logger } from "@/middlewares/pino-logger";

import { friendRepository } from "./friends.repository";

class FriendService {
  async createFriendship(data) {
    const friendship = await friendRepository.createFriendRequestIntoDB(data);
    // logger.info(friendship, "from service");
    return friendship;
  }

  async acceptFriendship(data) {
    const updatedData = {
      ...data,
      status: "accepted",
    };
    const friendship = await friendRepository.updateFriendRequestIntoDB(updatedData);
    // logger.info(friendship, "from service");
    return friendship;
  }

  async rejectFriendship(data) {
    const updatedData = {
      ...data,
      status: "rejected",
    };
    const friendship = await friendRepository.updateFriendRequestIntoDB(updatedData);
    // logger.info(friendship, "from service");
    return friendship;
  }

  async getMyFriendShips(data){
    const friendship=await friendRepository.findFriendship(data)
    return friendship
  }

}

export const friendService = new FriendService();
