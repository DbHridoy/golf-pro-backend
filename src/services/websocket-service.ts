/* eslint-disable no-console */
import type { Server as HTTPServer } from "node:http";

import { Server as SocketIOServer } from "socket.io";

import { env } from "@/env";

let io: SocketIOServer;

// Initialize WebSocket server
export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join event room
    socket.on("join_event", (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`Socket ${socket.id} joined event:${eventId}`);
    });

    // Leave event room
    socket.on("leave_event", (eventId: string) => {
      socket.leave(`event:${eventId}`);
      console.log(`Socket ${socket.id} left event:${eventId}`);
    });

    // Join player-specific room
    socket.on("join_player", (playerId: string) => {
      socket.join(`player:${playerId}`);
      console.log(`Socket ${socket.id} joined player:${playerId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

// Broadcast score update to event room
export async function broadcastScoreUpdate(eventId: string, data: any) {
  if (!io) {
    console.error("WebSocket not initialized");
    return;
  }

  io.to(`event:${eventId}`).emit("score_updated", {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

// Broadcast leaderboard update
export async function broadcastLeaderboardUpdate(eventId: string, leaderboard: any) {
  if (!io) {
    console.error("WebSocket not initialized");
    return;
  }

  io.to(`event:${eventId}`).emit("leaderboard_updated", {
    timestamp: new Date().toISOString(),
    leaderboard,
  });
}

// Broadcast player milestone (birdie, eagle, etc.)
export async function broadcastMilestone(eventId: string, playerId: string, milestone: any) {
  if (!io)
    return;

  io.to(`event:${eventId}`).emit("milestone_achieved", {
    timestamp: new Date().toISOString(),
    playerId,
    ...milestone,
  });
}

// Broadcast event status change (NEW - IMPLEMENTATION)
export async function broadcastEventStatus(eventId: string, status: string) {
  if (!io) {
    console.error("WebSocket not initialized");
    return;
  }

  try {
    // Broadcast to event room
    io.to(`event:${eventId}`).emit("event_status_changed", {
      timestamp: new Date().toISOString(),
      eventId,
      status,
      message: getStatusMessage(status),
    });

    console.log(`[WebSocket] Event ${eventId} status changed to: ${status}`);
  }
  catch (error) {
    console.error("Error broadcasting event status:", error);
  }
}

// Send notification to specific player
export async function sendPlayerNotification(playerId: string, notification: any) {
  if (!io)
    return;

  io.to(`player:${playerId}`).emit("notification", {
    timestamp: new Date().toISOString(),
    ...notification,
  });
}

// Broadcast participant joined event
export async function broadcastParticipantJoined(eventId: string, playerData: any) {
  if (!io)
    return;

  io.to(`event:${eventId}`).emit("participant_joined", {
    timestamp: new Date().toISOString(),
    eventId,
    player: playerData,
  });
}

// Broadcast participant left event
export async function broadcastParticipantLeft(eventId: string, playerId: string) {
  if (!io)
    return;

  io.to(`event:${eventId}`).emit("participant_left", {
    timestamp: new Date().toISOString(),
    eventId,
    playerId,
  });
}

// Helper function to get status message
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    upcoming: "Event registration is open",
    active: "Event has started! Good luck to all participants!",
    completed: "Event has been completed. Check the final leaderboard!",
    cancelled: "Event has been cancelled",
  };

  return messages[status] || "Event status updated";
}

// =========================MATCH=================================
/**
 * Broadcast location update to all event participants
 */
export async function broadcastLocationUpdate(eventId: any, locationData: any) {
  if (!io) {
    console.warn("WebSocket not initialized");
    return;
  }

  io.to(`event-${eventId}`).emit("location-update", locationData);
}

// Get WebSocket instance (for external use)
export const getSocketIO = () => io;
