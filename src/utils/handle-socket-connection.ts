import { channelRepository } from "@/modules/channel/channel.repository.js";

import handleChannelChat from "./handle-channel-chat.js";
import handleSingleChat from "./handle-single-chat.js";

export default async function handleConnection(io, socket) {
  try {
    const userId = socket.handshake.query.userId as string;
    const chatWith = socket.handshake.query.chatWith as string;

    if (!userId)
      return socket.disconnect();

    const channel = await channelRepository.getChannel(chatWith);

    if (channel) {
      // ✅ group chat
      return handleChannelChat(io, socket, channel, userId);
    }

    // ✅ single chat
    return handleSingleChat(io, socket, chatWith, userId);
  }
  catch (err) {
    console.error("Socket connection error:", err);
    socket.disconnect();
  }
}
