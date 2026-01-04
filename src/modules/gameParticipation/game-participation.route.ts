import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware.js";

import {
  getEventParticipations,
  getPlayerHistory,
  getPlayerParticipation,
  getPlayerStatsSummary,
  leaveEvent,
  updateParticipationStats,
} from "./game-participation.controller";

const router = Router();

// Get all participations for an event
router.get("/event/:eventId", getEventParticipations);

// Get player's participation in specific event
router.get("/event/:eventId/player/:playerId", getPlayerParticipation);

// Get player's event history
router.get("/player/:playerId/history", getPlayerHistory);

// Get player statistics summary
router.get("/player/:playerId/stats", getPlayerStatsSummary);

// Protected routes
router.use(authMiddleware.authenticate);

// Update participation (internal - used by game controllers)
router.put("/:participationId", updateParticipationStats);

// Leave event
router.post("/event/:eventId/leave", leaveEvent);

export default router;
