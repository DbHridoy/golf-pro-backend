import { createServer } from "node:http";

import app from "@/app.js";
import { env } from "@/env.js";
import { logger } from "@/middlewares/pino-logger.js";

import { connectDB } from "./config/database.config";
import { connectSocket } from "./socket/socket-connection.js";

const port = env.PORT;

// make a server using app
const server = createServer(app);

// initialize socket
connectSocket(server);

// Start the server
server.listen(port, async () => {
  await connectDB();
  logger.info(`Listening: http://localhost:${port}`);
  logger.info(`API Documentation: http://localhost:${port}/api/v1/docs`);
});

// Server on error
server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
