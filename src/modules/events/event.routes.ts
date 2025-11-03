import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware.js";

import { acceptEventInvitation, declineEventInvitation } from "./event-invitation.service.js";
import { completeEvent, createEvent, deleteEvent, getAllEvents, getEventById, joinEvent, startEvent, updateEvent } from "./event.controller.js";

const router = Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:eventId", getEventById);

// Protected routes - require authentication
router.use(authMiddleware.authenticate);

// Club/Admin only routes
router.post("/", authMiddleware.authorize(["golf_club", "admin"]), createEvent);
router.put("/:eventId", authMiddleware.authorize(["golf_club", "admin"]), updateEvent);
router.delete("/:eventId", authMiddleware.authorize(["golf_club", "admin"]), deleteEvent);
router.post("/:eventId/start", authMiddleware.authorize(["golf_club", "admin"]), startEvent);
router.post("/:eventId/complete", authMiddleware.authorize(["golf_club", "admin"]), completeEvent);

// Golfer routes
router.post("/:eventId/join", joinEvent);

// Invitation management
router.post("/invitations/:invitationId/accept", authMiddleware.authorize(["golfer"]), acceptEventInvitation);
router.post("/invitations/:invitationId/decline", authMiddleware.authorize(["golfer"]), declineEventInvitation);

export default router;
