import { Types } from "mongoose";

import ClubModel from "../club/club.model";
import { golferRepository } from "../golfer/golfer.repository";
import ParticipantModel from "./conversation-participant.model";
import ConversationModel from "./conversation.model";
import conversationRepository from "./conversation.repository";
import { logger } from "@/middlewares/pino-logger";
import PrivateConversationModel from "./private-conversation.model";

class ConversationService {
  async getOrCreatePrivate(userId: string, golferId: string) {
    const newPrivateConv = await ConversationModel.create({
      type: "private",
      members: [userId, golferId],
    });
    logger.info(`from conversation service: ${JSON.stringify(newPrivateConv)}`);
    await ParticipantModel.insertMany([
      { convId: newPrivateConv._id, userId },
      { convId: newPrivateConv._id, userId: golferId },
    ]);
    return newPrivateConv;
  }

  async createChannel(data: any) {
    const newChannel = await conversationRepository.createNewChannel(data);
    const newParticipant = await ParticipantModel.insertMany(
      data.members.map((uid: any) => ({
        convId: newChannel._id,
        userId: uid,
      }))
    );
    logger.info(`from conversation service ${newParticipant}`);
    return newChannel;
  }

  // async createClubConversation(clubId: string, title: string) {
  //   const club = await ClubModel.findById(clubId)
  //     .populate("userId", "fullName")
  //     .lean();
  //   if (!club) throw new Error("Club not found");
  //   logger.info(`from conversation service: ${JSON.stringify(club)}`);

  //   const memberIds: string[] = club.members as any;

  //   const conv = await ConversationModel.create({
  //     type: "club",
  //     name: club.userId.fullName,
  //     title,
  //   });

  //   await ParticipantModel.insertMany(
  //     memberIds.map((uid) => ({
  //       convId: conv._id,
  //       userId: uid,
  //     }))
  //   );
  //   return conv;
  // }

  async createClubConversation(clubId: string, title: string) {
    const club = await ClubModel.findById(clubId)
      .populate("userId", "fullName")
      .lean();
    if (!club) throw new Error("Club not found");
    logger.info(`from conversation service: ${JSON.stringify(club)}`);

    const conv = await ConversationModel.create({
      type: "club",
      name: club.userId.fullName,
      title,
    });

    await ParticipantModel.insertMany(
      memberIds.map((uid) => ({
        convId: conv._id,
        userId: uid,
      }))
    );
    return conv;
  }

  async listForUser(userId: string) {
    logger.info(`from service layer - email: ${userId}`);
    return await ParticipantModel.find({ userId }).lean();
  }

  async isParticipant(convId: string, userId: string) {
    return !!(await ParticipantModel.exists({ convId, userId }));
  }
}

export const conversationService = new ConversationService();
