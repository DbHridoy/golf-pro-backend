// file: src/cron/jobs.ts

import cron from "node-cron";

import { logger } from "@/middlewares/pino-logger";

import { checkOfflinePlayers } from "../services/offline-monitor.service";

/**
 * Run offline player check every 5 minutes
 */
export function setupCronJobs() {
  // Every 5 minutes:
  cron.schedule("*/5 * * * *", async () => {
    logger.warn("Running offline player check...");
    try {
      const result = await checkOfflinePlayers();
      logger.warn(`Invalidated ${result.invalidated} scorecards`);
    }
    catch (error) {
      logger.error(error, "Cron job error:");
    }
  });

  logger.warn("✅ Cron jobs initialized");
}
