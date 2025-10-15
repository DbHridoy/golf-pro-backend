import { Types } from "mongoose";

import ClubModel from "../club/club.model";
import ParticipantModel from "./conversation-participant.model";
import ConversationModel from "./conversation.model";

class ConversationService {
  /* private DM (a,b) — idempotent */
  async getOrCreatePrivate(a: string, b: string) {
    const existing = await ConversationModel.aggregate([
      { $match: { type: "private" } },
      { $lookup: {
        from: "conversationparticipants",
        localField: "_id",
        foreignField: "convId",
        as: "parts",
      } },
      { $match: { "parts.userId": { $all: [new Types.ObjectId(a), new Types.ObjectId(b)] } } },
    ]);
    if (existing[0])
      return existing[0];

    const conv = await ConversationModel.create({ type: "private", createdBy: a });
    await ParticipantModel.insertMany([
      { convId: conv._id, userId: a, role: "owner" },
      { convId: conv._id, userId: b, role: "member" },
    ]);
    return conv;
  }

  /* club chat — everyone in club */
  async createClubConversation(creatorId: string, clubId: string, title: string) {
    const club = await ClubModel.findById(clubId).lean();
    if (!club)
      throw new Error("Club not found");

    // TODO: adapt to your club-membership store
    const memberIds: string[] = club.members as any;

    const conv = await ConversationModel.create({
      type: "club",
      clubId,
      title,
      createdBy: creatorId,
    });

    await ParticipantModel.insertMany(
      memberIds.map(uid => ({
        convId: conv._id,
        userId: uid,
        role: uid === creatorId ? "owner" : "member",
      })),
    );
    return conv;
  }

  /* list all conversations for UI inbox */
  listForUser(userId: string) {
    return ParticipantModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $lookup: {
        from: "conversations",
        localField: "convId",
        foreignField: "_id",
        as: "conv",
      } },
      { $unwind: "$conv" },
      { $project: { _id: 0, role: 1, conv: 1 } },
    ]);
  }

  async isParticipant(convId: string, userId: string) {
    return !!await ParticipantModel.exists({ convId, userId });
  }
}

export const conversationService = new ConversationService();
