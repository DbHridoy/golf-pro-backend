import { logger } from "@/middlewares/pino-logger";
import { channelRepository } from "@/modules/channel/channel.repository";

import handleChannelChat from "./handle-channel-chat.js";
import handleSingleChat from "./handle-single-chat.js";

function isChannel(chatWith) {
  return channelRepository.getChannel(chatWith);
}
export default function handleConnection(SocketServer, socket: any) {
  // For Postman/testing we can still use handshake query for now
  const userId = socket.handshake.query.userId as string;
  const chatWith = socket.handshake.query.chatWith as string;

  if (isChannel(chatWith)) {
    return handleChannelChat(SocketServer, socket, data);
  }

  return handleSingleChat(SocketServer, socket, data);
}
