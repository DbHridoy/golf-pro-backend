// import { io } from "./socket.js";

import { channelRepository } from "./channel.repository";

// class ChannelService {
//   // Unified room naming
//   getRoom(userId: string, chatWithOrChannelId?: string) {
//     if (!chatWithOrChannelId)
//       return userId; // personal/fallback room
//     if (chatWithOrChannelId.startsWith("channel_"))
//       return chatWithOrChannelId; // group
//     return [userId, chatWithOrChannelId].sort().join("-"); // 1-1
//   }

//   // Send message to a room
//   sendMessage(room: string, data: { senderId: string; message: string }) {
//     const payload = {
//       ...data,
//       timestamp: Date.now(),
//     };

//     // Emit to all in room (including sender)
//     io.in(room).emit("receive-message", payload);

//     // Optional: persist to DB here
//     // await MessageModel.create({ room, ...payload });
//   }
// }

// export const channelService = new ChannelService();

class ChannelService {
  createChannel(data) {
    const channel = channelRepository.createChannel(data);
    return channel;
  }

  getChannel(id) {
    const channel = channelRepository.getChannel(id);
    return channel;
  }

  getAllChannels() {
    const channels = channelRepository.getAllChannels();
    return channels;
  }

  updateChannel(id, data) {
    const channel = channelRepository.updateChannel(id, data);
    return channel;
  }

  deleteChannel(id) {
    const channel = channelRepository.deleteChannel(id);
    return channel;
  }
}

export const channelService = new ChannelService();
