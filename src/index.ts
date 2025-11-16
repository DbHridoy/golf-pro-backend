import { createServer } from "node:http";

import app from "@/app.js";
import { env } from "@/env.js";
import { logger } from "@/middlewares/pino-logger.js";

import { connectDB } from "./config/database.config";
import { initSocket } from "./socket.js";

const server = createServer(app);

// Initialize Socket once with all logic
initSocket(server);

server.listen(env.PORT, "0.0.0.0", async () => {
  await connectDB();
  logger.info(`Listening: http://localhost:${env.PORT}`);
});
