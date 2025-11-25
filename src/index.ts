import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

import app from "@/app.js";
import { env } from "@/env.js";
import { logger } from "@/middlewares/pino-logger.js";

import { connectDB } from "./config/database.config";
import { initializeSocket } from "./services/socket-service.js";
import { initSocket } from "./socket.js";

const port = env.PORT;

// make a server using app
const server = createServer(app);

// initialize socket
initSocket(server);

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // WebSocket primary, polling fallback
  // reconnection: true,
  // reconnectionDelay: 1000,
  // reconnectionDelayMax: 5000,
  // reconnectionAttempts: 5,
});

// Initialize socket service
initializeSocket(io);

// Start the server
server.listen(port, "0.0.0.0", async () => {
  await connectDB();

  logger.info(`Listening: http://localhost:${port}`);
  logger.info(`API Documentation: http://localhost:${port}/api/v1/docs`);
});

// Server on error
server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(
      `Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`,
    );
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});