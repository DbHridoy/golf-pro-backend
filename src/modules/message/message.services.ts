// src/modules/message/message.service.ts
import MessageModel from "./message.model";

class MessageService {
  create(data: any) {
    return MessageModel.create(data);
  }

  getByConversation(convId: string, limit = 50) {
    return MessageModel
      .find({ convId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export const messageService = new MessageService();
