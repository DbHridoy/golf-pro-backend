// file: src/modules/location/location.routes.ts
import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import {
  findNearbyGolfers,
  getClubMembersLocations,
  getEventParticipantsLocations,
  toggleLocationSharing,
  updateMyLocation,
} from "./location.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware.authenticate);

// Golfers only
router.use(authMiddleware.authorize(["golfer"]));

// Update current location
router.post("/my-location", updateMyLocation);

// Toggle location sharing
router.patch("/location-sharing", toggleLocationSharing);

// Get club members' locations
router.get("/clubs/:clubId/members-locations", getClubMembersLocations);

// Get event participants' locations
router.get(
  "/events/:eventId/participants-locations",
  getEventParticipantsLocations
);

// Find nearby golfers
router.get("/nearby", findNearbyGolfers);

export default router;
