// src/modules/message/message.service.ts
import { logger } from "@/middlewares/pino-logger";
import ConversationModel from "../conversation/conversation.model";
import { userRepository } from "../user/user.repository";
import MessageModel from "./message.model";

class MessageService {
  create(data: any) {
    return MessageModel.create(data);
  }

  async getByConversation({ convId }: { convId: string }) {
    const messages = await MessageModel.find({ convId })
      .sort({ createdAt: -1 }) // ascending order, oldest first
      .populate({
        path: "senderId",
        select: "_id role",
        populate: [
          { path: "golfer", select: "fullName profileImage" },
          { path: "admin", select: "fullName profileImage" },
        ],
      });

    return messages;
  }
}

export const messageService = new MessageService();
