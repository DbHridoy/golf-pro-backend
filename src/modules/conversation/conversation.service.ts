import { Types } from "mongoose";

import { logger } from "@/middlewares/pino-logger";

import AdminModel from "../admin/admin.model";
import ConversationParticipantModel from "./conversation-participant.model";
import ConversationModel from "./conversation.model";
import conversationRepository from "./conversation.repository";

class ConversationService {
  async getOrCreatePrivate(userId: string, golferId: string) {
  // Try to find an existing private conversation
    let conv = await ConversationModel.findOne({
      type: "private",
      members: { $all: [userId, golferId] },
    }).populate("members");

    if (!conv) {
    // Create a new private conversation
      conv = await ConversationModel.create({
        type: "private",
        members: [userId, golferId],
      });

      // Populate members after creation
      await conv.populate("members");

      // Add participants
      await ConversationParticipantModel.insertMany([
        { convId: conv._id, userId },
        { convId: conv._id, userId: golferId },
      ]);
    }

    // Determine receiverId (the member that is NOT the current user)
    const receiver = conv.members.find(
      (member: any) => member._id.toString() !== userId,
    );

    return {
      ...conv.toObject(), // convert mongoose doc to plain object
      receiverId: receiver, // populate with full member object
    };
  }

  async createChannel(data: any) {
    // Create a new channel
    const admins = await AdminModel.find();
    data.members.push(...admins.map(admin => admin.userId));
    logger.info("Members array →", data.members);
    const newChannel = await conversationRepository.createNewChannel(data);
    logger.info("New channel created →", newChannel);

    // Make sure members exist
    if (!data.members || !data.members.length) {
      logger.warn("No members provided to add as participants");
      return newChannel;
    }

    // Prepare participants array
    const participants = data.members.map((uid: any) => ({
      convId: newChannel._id,
      userId: uid,
    }));

    logger.info("Participants array →", participants);

    // Insert participants
    try {
      const inserted = await ConversationParticipantModel.insertMany(
        participants,
      );
      logger.info("Participants inserted successfully →", inserted);
    }
    catch (err) {
      logger.error("INSERT MANY ERROR →", err);
    }

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

  //   await ConversationParticipantModel.insertMany(
  //     memberIds.map((uid) => ({
  //       convId: conv._id,
  //       userId: uid,
  //     }))
  //   );
  //   return conv;
  // }

  // async createClubConversation(clubId: string, title: string) {
  //   const club = await ClubModel.findById(clubId)
  //     .populate("userId", "fullName")
  //     .lean();
  //   if (!club) throw new Error("Club not found");
  //   logger.info(`from conversation service: ${JSON.stringify(club)}`);

  //   const conv = await ConversationModel.create({
  //     type: "club",
  //     name: club.userId.fullName,
  //     title,
  //   });

  //   await ConversationParticipantModel.insertMany(
  //     memberIds.map((uid) => ({
  //       convId: conv._id,
  //       userId: uid,
  //     }))
  //   );
  //   return conv;
  // }

  async listForUser(userId: string) {
    logger.info(`from service layer - email: ${userId}`);
    const conversations = await ConversationModel.find({
      members: userId,
    })
      .populate("members", "fullName profileImage") // optional: populate members details
      .populate("clubId", "clubName clubProfileImage");
    return conversations;
  }

  async isParticipant(convId: string, userId: string) {
    return !!(await ConversationParticipantModel.exists({ convId, userId }));
  }

  getChannelStats() {
    return ConversationModel.countDocuments({ type: "channel" });
  }
}

export const conversationService = new ConversationService();
