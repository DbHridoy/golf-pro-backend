import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware.js";

import {
  createFriendEvent,
  getFriendEventInvitations,
  getGolferFriendEvents,
} from "./friend-event.service";

const friendEventRouter = Router();

// ============================================
// GOLFER-ONLY ROUTES
// ============================================

/**
 * POST /api/v1/friend-events
 * Create a new friend event
 * Body: {
 *   eventName: string,
 *   courseId: ObjectId,
 *   eventDate: ISO Date,
 *   eventTime: string (HH:mm),
 *   gameFormat: "stroke_play",
 *   selectedGolfers: ObjectId[],
 *   description?: string
 * }
 */
friendEventRouter.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize("golfer"),
  createFriendEvent,
);

/**
 * GET /api/v1/friend-events/my-events
 * Get all friend events created by current golfer
 */
friendEventRouter.get(
  "/my-events",
  authMiddleware.authenticate,
  authMiddleware.authorize("golfer"),
  getGolferFriendEvents,
);

/**
 * GET /api/v1/friend-events/my-invitations
 * Get all friend event invitations for current golfer
 */
friendEventRouter.get(
  "/my-invitations",
  authMiddleware.authenticate,
  authMiddleware.authorize("golfer"),
  getFriendEventInvitations,
);

export default friendEventRouter;
