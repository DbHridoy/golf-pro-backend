// socket.ts
import type { Server as HTTPServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import ParticipantModel from "./modules/conversation/conversation-participant.model";
import MessageModel from "./modules/message/message.model";
import { jwtUtils } from "./utils/jwt.utils";

// eslint-disable-next-line import/no-mutable-exports
let io: SocketServer;

export function initSocket(server: HTTPServer) {
  io = new SocketServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // ✅ Authenticate socket connection
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      if (!authHeader) return next(new Error("No token provided"));

      const token = authHeader.split(" ")[1];
      const decoded = jwtUtils.verifyAccessToken(token);

      socket.userId = decoded.userId; // store verified userId
      console.log(socket.userId);
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // ✅ Handle connected sockets
  io.on("connection", (socket) => {
    const userId = socket.userId; // ✅ safe and decoded
    console.log(`✅ User connected: ${userId}`);

    // Join a conversation room
    socket.on("join", async ({ convId }) => {
      const ok = await ParticipantModel.exists({ convId, userId });
      if (ok) {
        socket.join(convId);
        console.log(`👥 User ${userId} joined conversation ${convId}`);
      } else {
        socket.emit("error", "You are not a participant of this conversation");
      }
    });

    // Send a message
    socket.on("send-msg", async ({ convId, content, type }) => {
      const ok = await ParticipantModel.exists({ convId, userId });
      if (!ok) return socket.emit("error", "Not a participant");

      const msg = await MessageModel.create({
        convId,
        senderId: userId,
        content,
        messageType: type,
      });

      io.to(convId).emit("new-msg", msg);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${userId}`);
    });
  });

  return io;
}

export { io };
