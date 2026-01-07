import { logger } from "@/middlewares/pino-logger";

import ClubModel from "../club/club.model";
import GolferModel from "../golfer/golfer.model";
import UserModel from "../user/user.model";

class AdminController {
async getAnyUser(req: any, res: any) {
  const { userId } = req.params;
  logger.info(`User ID: ${userId}`);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Try finding the user in GolferModel first
  const golfer = await GolferModel.findOne({ userId }).populate("userId", "role  fullName email handicapIndex").lean();
  if (golfer) {
    logger.info(`Golfer: ${JSON.stringify(golfer)}`);
    return res.status(200).json(golfer);
  }

  // Otherwise, check ClubModel
  const club = await ClubModel.findOne({ userId }).populate("userId", "role  fullName email handicapIndex").lean();
  if (club) {
    logger.info(`Club: ${JSON.stringify(club)}`);
    return res.status(200).json(club);
  }

  // Neither found
  return res.status(404).json({ message: "User not found" });
}


  async getAllUsers(req: any, res: any) {
    const users = await UserModel.find().lean();
    return res.status(200).json(users);
  }
}
const adminController = new AdminController();
export default adminController;
