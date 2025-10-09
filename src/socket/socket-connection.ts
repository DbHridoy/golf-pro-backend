import type { Server as HTTPServer } from "node:http";
import type { Socket } from "socket.io";

import { Server as ChatServer } from "socket.io";

import { logger } from "@/middlewares/pino-logger.js";

import Conversation from "../modules/conversation/conversation.model.js";
import User from "../modules/user/user.model.js";
import { handleCallEvents } from "./handle-call-events.js";
import handleChatEvents from "./handle-chat-events.js";

let io: ChatServer;

const onlineUsers = new Map<string, string>();

function connectSocket(server: HTTPServer) {
  // create a socket server
  if (!io) {
    io = new ChatServer(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
      pingInterval: 30000,
      pingTimeout: 5000,
    });
  }

  // connect socket
  io.on("connection", async (socket: Socket) => {
    logger.info("Client connected:", socket.id);

    const userId = socket.handshake.query.id as string;

    if (!userId) {
      socket.emit("error", "User ID is required");
      logger.info("User ID is required");
      socket.disconnect();
      return;
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      socket.emit("error", "User not found");
      logger.info("User not found");
      socket.disconnect();
      return;
    }

    const currentUserId = currentUser._id.toString();

    socket.join(currentUserId);

    onlineUsers.set(currentUserId, socket.id);

    const userConversations = await Conversation.find({
      participants: currentUserId,
    }).select("_id");

    logger.info("userConversations", userConversations);
    console.log(userConversations);
    userConversations.forEach(conv => socket.join(conv._id.toString()));
    handleChatEvents(io, socket, currentUserId);
    handleCallEvents(io, socket, currentUserId);
    
    logger.info("onlineUsers", onlineUsers);
    console.log(onlineUsers);
    socket.on("disconnect", () => {
      logger.info("Disconnected:", socket.id);
      onlineUsers.delete(currentUserId);
    });
  });

  return io;
}

function getSocketIO() {
  if (!io) {
    throw new Error("socket.io is not initialized");
  }
  return io;
}

export { connectSocket, getSocketIO, onlineUsers };
