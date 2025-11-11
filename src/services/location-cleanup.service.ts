// file: src/services/location-cleanup.service.ts
import GolferModel from "@/modules/golfer/golfer.model";

/**
 * Clear locations that haven't been updated in 10 minutes
 * Run every 5 minutes
 */
export async function cleanStaleLocations() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const result = await GolferModel.updateMany(
      {
        locationUpdatedAt: { $lt: tenMinutesAgo },
        currentLocation: { $ne: null },
      },
      {
        $set: {
          currentLocation: null,
          currentHole: null,
          isOnline: false,
        },
      },
    );

    console.log(`Cleaned ${result.modifiedCount} stale locations`);
    return result;
  }
  catch (error) {
    console.error("Error cleaning stale locations:", error);
    throw error;
  }
}

// Schedule with node-cron
// import cron from "node-cron";
// cron.schedule("*/5 * * * *", cleanStaleLocations); // Every 5 minutes
