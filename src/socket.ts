// socket.ts
import type { Server as HTTPServer } from "node:http";

import { Server as SocketServer } from "socket.io";

import ParticipantModel from "./modules/conversation/conversation-participant.model";
import MessageModel from "./modules/message/message.model";

// eslint-disable-next-line import/no-mutable-exports
let io: SocketServer;

export function initSocket(server: HTTPServer) {
  io = new SocketServer(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId; // set during handshake

    /* join personal room so we can push inbox messages */
    socket.on("join", async ({ convId }) => {
      const ok = await ParticipantModel.exists({ convId, userId });
      if (ok)
        socket.join(convId);
    });

    socket.on("send-msg", async ({ convId, content, type }) => {
      const ok = await ParticipantModel.exists({ convId, userId });
      if (!ok)
        return socket.emit("error", "Not a participant");

      const msg = await MessageModel.create({ convId, senderId: userId, content, messageType: type });
      io.to(convId).emit("new-msg", msg);
    });
  });
  return io;
}

export { io };
