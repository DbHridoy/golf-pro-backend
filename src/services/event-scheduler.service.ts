import cron from "node-cron";

import { logger } from "@/middlewares/pino-logger.js";

import EventModel from "../modules/events/event.model.js";
import { broadcastEventStatus } from "./websocket-service.js";

/**
 * Automatically transition events from 'upcoming' to 'active'
 * when their scheduled time arrives
 */
export function initializeEventScheduler() {
  // Run every minute to check for events that should start
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find events that should be active now
      const eventsToStart = await EventModel.find({
        status: "upcoming",
        eventDate: { $lte: now },
        // currentParticipants: { $gte: 2 }, // Ensure minimum participants
      });

      for (const event of eventsToStart) {
        // Combine eventDate and eventTime to get exact start time
        const [hours, minutes] = event.eventTime.split(":").map(Number);
        const scheduledStartTime = new Date(event.eventDate);
        scheduledStartTime.setHours(hours, minutes, 0, 0);

        // Check if current time has passed the scheduled start time
        if (now >= scheduledStartTime) {
          logger.info(`Auto-starting event: ${event.eventName} (${event._id})`);

          event.status = "active";
          await event.save();

          // Broadcast to all connected clients via WebSocket
          await broadcastEventStatus(event._id.toString(), "active");

          logger.info(`✅ Event ${event.eventName} automatically started`);
        }
      }

      // Optional: Auto-complete events after a certain duration
      // This example auto-completes events 6 hours after start time
      const eventsToComplete = await EventModel.find({
        status: "active",
      });

      for (const event of eventsToComplete) {
        const [hours, minutes] = event.eventTime.split(":").map(Number);
        const scheduledStartTime = new Date(event.eventDate);
        scheduledStartTime.setHours(hours, minutes, 0, 0);

        // Add 6 hours for typical round duration
        const autoCompleteTime = new Date(scheduledStartTime.getTime() + 6 * 60 * 60 * 1000);

        if (now >= autoCompleteTime) {
          logger.info(`Auto-completing event: ${event.eventName} (${event._id})`);

          event.status = "completed";
          await event.save();

          await broadcastEventStatus(event._id.toString(), "completed");

          logger.info(`✅ Event ${event.eventName} automatically completed`);
        }
      }
    }
    catch (error: any) {
      logger.error("Error in event scheduler:", error);
    }
  });

  logger.info("✅ Event scheduler initialized - checking events every minute");
}