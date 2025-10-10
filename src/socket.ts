import type { Server as HTTPServer } from "node:http";

import { Server as SocketServer } from "socket.io";

import handleConnection from "./helper/handle-socket-connection.js";

// socket.ts
let io: SocketServer;

export function initSocket(server: HTTPServer) {
  io = new SocketServer(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
  io.on("connection", socket => handleConnection(SocketServer, socket));
  return io;
}
export { io };
