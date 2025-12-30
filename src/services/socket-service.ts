/* eslint-disable import/no-mutable-exports */
// file: src/services/socket-service.ts (NEW/UPDATED)
import type { Socket, Server as SocketIOServer } from "socket.io";

import GolferModel from "@/modules/golfer/golfer.model";
import MembershipModel from "@/modules/memberships/memberships.model";
import UserModel from "@/modules/user/user.model";

let io: SocketIOServer | null = null;

// Store active connections: userId -> socketId
const activeConnections = new Map<string, Set<string>>();

// Store user's club IDs: userId -> Set<clubId>
const userClubs = new Map<string, Set<string>>();

export function initializeSocket(socketIO: SocketIOServer) {
  io = socketIO;

  // Configure Socket.io
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join location namespace
    socket.on("location:init", handleLocationInit);
    socket.on("location:update", handleLocationUpdate);
    socket.on("location:disconnect", handleLocationDisconnect);
    socket.on("disconnect", handleDisconnect.bind(socket));
  });

  console.log("Socket.io service initialized");
}

/**
 * Initialize location tracking when user connects
 * Authenticate user and join club rooms
 */
async function handleLocationInit(socket: Socket, data: any) {
  try {
    const { userId, token } = data;

    if (!userId || !token) {
      socket.emit("location:error", { message: "Missing userId or token" });
      return;
    }

    // Verify token and get user
    const user = await UserModel.findById(userId).select("_id email");
    if (!user) {
      socket.emit("location:error", { message: "User not found" });
      return;
    }

    // Find golfer profile
    const golfer = await GolferModel.findOne({ userId }).select(
      "clubId isLocationSharingEnabled isOnline",
    );

    if (!golfer) {
      socket.emit("location:error", { message: "Golfer profile not found" });
      return;
    }

    // Check if location sharing is enabled
    if (!golfer.isLocationSharingEnabled) {
      socket.emit("location:error", {
        message: "Location sharing is disabled. Enable it in settings.",
      });
      return;
    }

    // Store connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId)!.add(socket.id);

    // Get all clubs for this golfer
    const clubIds = golfer.clubId.map((id: any) => id.toString());
    userClubs.set(userId, new Set(clubIds));

    // Join club rooms
    clubIds.forEach((clubId: string) => {
      socket.join(`club-${clubId}`);
      console.log(`User ${userId} joined club room: club-${clubId}`);
    });

    // Mark user as online
    await GolferModel.findByIdAndUpdate(golfer._id, {
      isOnline: true,
      lastActiveAt: new Date(),
    });

    // Emit success
    socket.emit("location:initialized", {
      message: "Location tracking initialized",
      userId,
      clubs: clubIds,
    });

    console.log(`Location tracking initialized for user: ${userId}`);
  }
  catch (error) {
    console.error("Error in handleLocationInit:", error);
    socket.emit("location:error", { message: "Internal server error" });
  }
}

/**
 * Handle real-time location updates from client
 */
async function handleLocationUpdate(socket: Socket, data: any) {
  try {
    const { userId, latitude, longitude, currentHole, currentEventId } = data;

    // Validate location data
    if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      socket.emit("location:error", { message: "Invalid coordinates" });
      return;
    }

    // Find golfer
    const golfer = await GolferModel.findOne({ userId }).select(
      "_id clubId isLocationSharingEnabled currentEventId",
    );

    if (!golfer) {
      socket.emit("location:error", { message: "Golfer not found" });
      return;
    }

    // Check if location sharing is enabled
    if (!golfer.isLocationSharingEnabled) {
      socket.emit("location:error", { message: "Location sharing is disabled" });
      return;
    }

    // Update golfer location in database
    const updateData: any = {
      currentLocation: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      locationUpdatedAt: new Date(),
      isOnline: true,
      lastActiveAt: new Date(),
    };

    if (currentHole) {
      updateData.currentHole = currentHole;
    }

    if (currentEventId) {
      updateData.currentEventId = currentEventId;
    }

    await GolferModel.findByIdAndUpdate(golfer._id, updateData);

    // Prepare broadcast data
    const locationData = {
      golferId: golfer._id.toString(),
      userId,
      latitude,
      longitude,
      currentHole: currentHole || null,
      currentEventId: currentEventId || null,
      timestamp: new Date(),
    };

    // Broadcast to all club members
    const clubIds = Array.from(userClubs.get(userId) || []);
    clubIds.forEach((clubId: string) => {
      io?.to(`club-${clubId}`).emit("location:updated", locationData);
    });

    // If in an event, also broadcast to event participants
    if (currentEventId) {
      io?.to(`event-${currentEventId}`).emit("location:updated", locationData);
    }

    socket.emit("location:update-confirmed", { timestamp: new Date() });
  }
  catch (error) {
    console.error("Error in handleLocationUpdate:", error);
    socket.emit("location:error", { message: "Failed to update location" });
  }
}

/**
 * Handle location disconnect (user stops sharing)
 */
async function handleLocationDisconnect(socket: Socket, data: any) {
  try {
    const { userId } = data;

    const golfer = await GolferModel.findOne({ userId });
    if (golfer) {
      await GolferModel.findByIdAndUpdate(golfer._id, {
        currentLocation: null,
        locationUpdatedAt: null,
        currentHole: null,
      });
    }

    // Broadcast to all clubs that user's location is cleared
    const clubIds = Array.from(userClubs.get(userId) || []);
    clubIds.forEach((clubId: string) => {
      io?.to(`club-${clubId}`).emit("location:user-offline", { userId });
    });

    socket.emit("location:disconnected", { message: "Location tracking stopped" });
  }
  catch (error) {
    console.error("Error in handleLocationDisconnect:", error);
  }
}

/**
 * Handle socket disconnect
 */
// async function handleDisconnect(socket: Socket) {
//   try {
//     console.log(`Socket disconnected: ${socket.id}`);

//     // Find and remove connection
//     for (const [userId, socketIds] of activeConnections.entries()) {
//       if (socketIds.has(socket.id)) {
//         socketIds.delete(socket.id);

//         // If no more connections for this user, mark as offline
//         if (socketIds.size === 0) {
//           const golfer = await GolferModel.findOne({ userId });
//           if (golfer) {
//             await GolferModel.findByIdAndUpdate(golfer._id, {
//               isOnline: false,
//               currentLocation: null,
//               currentHole: null,
//             });

//             // Broadcast to all clubs
//             const clubIds = Array.from(userClubs.get(userId) || []);
//             clubIds.forEach((clubId: string) => {
//               io?.to(`club-${clubId}`).emit("location:user-offline", {
//                 userId,
//                 reason: "disconnected",
//               });
//             });
//           }

//           activeConnections.delete(userId);
//           userClubs.delete(userId);
//         }

//         break;
//       }
//     }
//   }
//   catch (error) {
//     console.error("Error in handleDisconnect:", error);
//   }
// }

/**
 * Handle socket disconnect
 */
async function handleDisconnect(this: Socket, reason: string) {
  try {
    console.log(`Socket disconnected: ${this.id}, reason: ${reason}`);

    // Find and remove connection
    for (const [userId, socketIds] of activeConnections.entries()) {
      if (socketIds.has(this.id)) {
        socketIds.delete(this.id);

        // If no more connections for this user, mark as offline
        if (socketIds.size === 0) {
          const golfer = await GolferModel.findOne({ userId });
          if (golfer) {
            await GolferModel.findByIdAndUpdate(golfer._id, {
              isOnline: false,
              currentLocation: null,
              currentHole: null,
            });

            // Broadcast to all clubs
            const clubIds = Array.from(userClubs.get(userId) || []);
            clubIds.forEach((clubId: string) => {
              io?.to(`club-${clubId}`).emit("location:user-offline", {
                userId,
                reason: "disconnected",
              });
            });
          }

          activeConnections.delete(userId);
          userClubs.delete(userId);
        }

        break;
      }
    }
  }
  catch (error) {
    console.error("Error in handleDisconnect:", error);
  }
}

/**
 * Join event room (called when starting a round)
 */
export function joinEventRoom(userId: string, eventId: string) {
  const socketIds = activeConnections.get(userId);
  if (socketIds) {
    socketIds.forEach((socketId) => {
      io?.sockets.sockets.get(socketId)?.join(`event-${eventId}`);
      console.log(`User ${userId} joined event room: event-${eventId}`);
    });
  }
}

/**
 * Leave event room (called when round ends)
 */
export function leaveEventRoom(userId: string, eventId: string) {
  const socketIds = activeConnections.get(userId);
  if (socketIds) {
    socketIds.forEach((socketId) => {
      io?.sockets.sockets.get(socketId)?.leave(`event-${eventId}`);
      console.log(`User ${userId} left event room: event-${eventId}`);
    });
  }
}

/**
 * Broadcast location update (for API calls)
 */
export function broadcastLocationUpdate(locationData: any) {
  if (!io)
    return;
  io.emit("location:updated", locationData);
}

/**
 * Get active users in a club
 */
export async function getActiveUsersInClub(clubId: string): Promise<any[]> {
  const activeUsers: any[] = [];

  for (const [userId, socketIds] of activeConnections.entries()) {
    if (socketIds.size > 0) {
      const userClubIds = userClubs.get(userId);
      if (userClubIds?.has(clubId)) {
        const golfer = await GolferModel.findOne({ userId }).select(
          "_id fullName profileImage currentLocation locationUpdatedAt currentHole currentEventId",
        );

        if (golfer && golfer.currentLocation) {
          activeUsers.push({
            golferId: golfer._id,
            userId,
            fullName: golfer.fullName,
            profileImage: golfer.profileImage,
            location: {
              latitude: golfer.currentLocation.coordinates[1],
              longitude: golfer.currentLocation.coordinates[0],
            },
            currentHole: golfer.currentHole,
            currentEventId: golfer.currentEventId,
            lastUpdated: golfer.locationUpdatedAt,
          });
        }
      }
    }
  }

  return activeUsers;
}

export { io };
