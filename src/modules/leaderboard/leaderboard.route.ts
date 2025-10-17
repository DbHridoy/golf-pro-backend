import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { LeaderboardController } from "./leaderboard.controller";

const router = Router();
const leaderboardController = new LeaderboardController();

// Get leaderboard with filters
router.get("/", auth, leaderboardController.getLeaderboard.bind(leaderboardController));

// Get upcoming events for current user
router.get("/upcoming", auth, leaderboardController.getUpcomingEvents.bind(leaderboardController));

// Get completed events for current user
router.get("/completed", auth, leaderboardController.getCompletedEvents.bind(leaderboardController));

// Get leaderboard for specific event
router.get("/event/:eventId", auth, leaderboardController.getEventLeaderboard.bind(leaderboardController));

export default router;
