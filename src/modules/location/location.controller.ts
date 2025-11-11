import type { Request, Response } from "express";

import { getActiveUsersInClub, joinEventRoom, leaveEventRoom } from "@/services/socket-service";
import { broadcastLocationUpdate } from "@/services/websocket-service";

import EventModel from "../events/event.model";
import GameParticipationModel from "../gameParticipation/game-participation.model";
import GolferModel from "../golfer/golfer.model";
import MembershipModel from "../memberships/memberships.model";

/**
 * Update golfer's current location
 * Called periodically from mobile app (every 30-60 seconds)
 */

export async function updateMyLocation(req: Request, res: Response) {
  try {
    const { latitude, longitude, currentHole } = req.body;

    const userId = req.user!.userId;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        message: "Latitude must be between -90 and 90",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: "Longitude must be between -180 and 180",
      });
    }

    const golfer = await GolferModel.findOne({ userId });
    if (!golfer) {
      return res.status(404).json({ message: "Golfer profile not found" });
    }

    if (!golfer.isLocationSharingEnabled) {
      return res.status(403).json({
        message: "Location sharing is disabled. Enable it in settings.",
      });
    }

    // Update location
    golfer.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude], // GeoJSON format: [lng, lat]
    };

    golfer.locationUpdatedAt = new Date();
    golfer.isOnline = true;
    golfer.lastActiveAt = new Date();

    if (currentHole) {
      golfer.currentHole = currentHole;
    }

    // Broadcast location update via WebSocket (if applicable)
    if (golfer.currentEventId) {
      await broadcastLocationUpdate(golfer.currentEventId, {
        golferId: golfer._id,
        fullName: golfer.fullName,
        profileImage: golfer.profileImage,
        currentHole: golfer.currentHole,
        location: {
          latitude,
          longitude,
        },
        updatedAt: golfer.locationUpdatedAt,
      });
    }

    return res.status(200).json({
      message: "Location updated successfully",
      location: {
        latitude,
        longitude,
        currentHole: golfer.currentHole,
        updatedAt: golfer.locationUpdatedAt,
      },
    });
  }
  catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get locations of all club members
 * Only returns locations of members who are currently online and sharing location
 */

/// PREVIOUS CODE - MAYBE WILL NEED THAT'S why don't remove this from this file.
// export async function getClubMembersLocations(req: Request, res: Response) {
//   try {
//     const { clubId } = req.params;
//     const userId = req.user!.userId;

//     // Verify requester is a member of this club
//     const requesterGolfer = await GolferModel.findOne({ userId });
//     if (!requesterGolfer) {
//       return res.status(404).json({ message: "Golfer profile not found" });
//     }

//     const membership = await MembershipModel.findOne({
//       clubId,
//       golferId: requesterGolfer._id,
//       status: "active",
//     });

//     if (!membership) {
//       return res.status(403).json({
//         message: "You must be a member of this club to view locations",
//       });
//     }

//     // Get all active members of this club
//     const memberships = await MembershipModel.find({
//       clubId,
//       status: "active",
//     }).select("golferId");

//     const golferIds = memberships.map(m => m.golferId);

//     // Find golfers who are online and sharing location
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//     const onlineGolfers = await GolferModel.find({
//       _id: { $in: golferIds },
//       isLocationSharingEnabled: true,
//       currentLocation: { $ne: null },
//       locationUpdatedAt: { $gte: fiveMinutesAgo }, // Only show if updated in last 5 minutes
//     }).select("fullName profileImage currentLocation locationUpdatedAt currentHole currentEventId").lean();

//     const locations = onlineGolfers.map(golfer => ({
//       golferId: golfer._id,
//       fullName: golfer.fullName,
//       profileImage: golfer.profileImage,
//       location: {
//         latitude: golfer.currentLocation.coordinates[1],
//         longitude: golfer.currentLocation.coordinates[0],
//       },
//       currentHole: golfer.currentHole,
//       currentEventId: golfer.currentEventId,
//       lastUpdated: golfer.locationUpdatedAt,
//     }));

//     return res.status(200).json({
//       clubId,
//       onlineMembersCount: locations.length,
//       locations,
//     });
//   }
//   catch (error) {
//     console.error("Error fetching club members locations:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }

// ======== nEW======
/**
 * Get all active club members' locations (using real-time socket data)
 */
export async function getClubMembersLocations(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const userId = req.user!.userId;

    // Verify requester is a member of this club
    const requesterGolfer = await GolferModel.findOne({ userId });
    if (!requesterGolfer) {
      return res.status(404).json({ message: "Golfer profile not found" });
    }

    const membership = await MembershipModel.findOne({
      clubId,
      golferId: requesterGolfer._id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        message: "You must be a member of this club to view locations",
      });
    }

    // Get active users from socket service
    const locations = await getActiveUsersInClub(clubId);

    return res.status(200).json({
      clubId,
      onlineMembersCount: locations.length,
      locations,
      source: "real-time",
    });
  }
  catch (error) {
    console.error("Error fetching club members locations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get locations of all participants in an event
 */
// =================OLDER=======================
// export async function getEventParticipantsLocations(req: Request, res: Response) {
//   try {
//     const { eventId } = req.params;
//     const userId = req.user!.userId;

//     // Check if event exists
//     const event = await EventModel.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     // Get all participants
//     const participations = await GameParticipationModel.find({
//       eventId,
//       status: { $in: ["playing", "completed"] },
//     })
//       .populate({
//         path: "playerId",
//         select: "fullName profileImage currentLocation locationUpdatedAt currentHole isLocationSharingEnabled",
//       })
//       .lean();

//     // Filter participants with location sharing enabled
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//     const locations = participations
//       .filter(p =>
//         p.playerId?.isLocationSharingEnabled
//         && p.playerId?.currentLocation
//         && p.playerId?.locationUpdatedAt >= fiveMinutesAgo,
//       )
//       .map(p => ({
//         golferId: p.playerId._id,
//         fullName: p.playerId.fullName,
//         profileImage: p.playerId.profileImage,
//         location: {
//           latitude: p.playerId.currentLocation.coordinates[1],
//           longitude: p.playerId.currentLocation.coordinates[0],
//         },
//         currentHole: p.playerId.currentHole,
//         lastUpdated: p.playerId.locationUpdatedAt,
//         participationStatus: p.status,
//         finalScore: p.finalScore,
//         netScore: p.netScore,
//       }));

//     return res.status(200).json({
//       eventId,
//       eventName: event.eventName,
//       activePlayersCount: locations.length,
//       locations,
//     });
//   }
//   catch (error) {
//     console.error("Error fetching event participants locations:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }
// =======================Older
/**
 * Get event participants' locations
 */
export async function getEventParticipantsLocations(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const userId = req.user!.userId;

    // Check if event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is a participant
    const requesterGolfer = await GolferModel.findOne({ userId });
    const isParticipant = await GameParticipationModel.findOne({
      eventId,
      playerId: requesterGolfer?._id,
    });

    if (!isParticipant && event.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to view this event's locations",
      });
    }

    // Get all participants
    const participations = await GameParticipationModel.find({
      eventId,
      status: { $in: ["playing", "completed"] },
    })
      .populate({
        path: "playerId",
        select: "fullName profileImage currentLocation locationUpdatedAt currentHole isLocationSharingEnabled",
      })
      .lean();

    // Filter participants with location sharing enabled and current location
    const locations = participations
      .filter(p => p.playerId?.isLocationSharingEnabled && p.playerId?.currentLocation)
      .map(p => ({
        golferId: p.playerId._id,
        fullName: p.playerId.fullName,
        profileImage: p.playerId.profileImage,
        location: {
          latitude: p.playerId.currentLocation.coordinates[1],
          longitude: p.playerId.currentLocation.coordinates[0],
        },
        currentHole: p.playerId.currentHole,
        lastUpdated: p.playerId.locationUpdatedAt,
        participationStatus: p.status,
        finalScore: p.finalScore,
        netScore: p.netScore,
      }));

    return res.status(200).json({
      eventId,
      eventName: event.eventName,
      activePlayersCount: locations.length,
      locations,
      source: "real-time",
    });
  }
  catch (error) {
    console.error("Error fetching event participants locations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Toggle location sharing on/off
 */
// ==============================OLD=========================
// export async function toggleLocationSharing(req: Request, res: Response) {
//   try {
//     const { enabled } = req.body;
//     const userId = req.user!.userId;

//     if (typeof enabled !== "boolean") {
//       return res.status(400).json({
//         message: "enabled field must be a boolean",
//       });
//     }

//     const golfer = await GolferModel.findOne({ userId });
//     if (!golfer) {
//       return res.status(404).json({ message: "Golfer profile not found" });
//     }

//     golfer.isLocationSharingEnabled = enabled;

//     // Clear location if disabled
//     if (!enabled) {
//       golfer.currentLocation = null;
//       golfer.locationUpdatedAt = null;
//       golfer.currentHole = null;
//     }

//     await golfer.save();

//     return res.status(200).json({
//       message: `Location sharing ${enabled ? "enabled" : "disabled"}`,
//       isLocationSharingEnabled: golfer.isLocationSharingEnabled,
//     });
//   }
//   catch (error) {
//     console.error("Error toggling location sharing:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }

// =====================================================NEW======================================

//   ===============================NEW====================
/**
 * Toggle location sharing on/off
 */
export async function toggleLocationSharing(req: Request, res: Response) {
  try {
    const { enabled } = req.body;
    const userId = req.user!.userId;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "enabled field must be a boolean",
      });
    }

    const golfer = await GolferModel.findOne({ userId });
    if (!golfer) {
      return res.status(404).json({ message: "Golfer profile not found" });
    }

    golfer.isLocationSharingEnabled = enabled;

    // Clear location if disabled
    if (!enabled) {
      golfer.currentLocation = null;
      golfer.locationUpdatedAt = null;
      golfer.currentHole = null;
      golfer.isOnline = false;
    }
    else {
      golfer.isOnline = true;
    }

    await golfer.save();

    return res.status(200).json({
      message: `Location sharing ${enabled ? "enabled" : "disabled"}`,
      isLocationSharingEnabled: golfer.isLocationSharingEnabled,
    });
  }
  catch (error) {
    console.error("Error toggling location sharing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Find nearby golfers (within specified radius in meters)
 */
export async function findNearbyGolfers(req: Request, res: Response) {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // Default 5km radius
    const userId = req.user!.userId;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    // Find current golfer
    const currentGolfer = await GolferModel.findOne({ userId });
    if (!currentGolfer) {
      return res.status(404).json({ message: "Golfer profile not found" });
    }

    // Get clubs the user is a member of
    const memberships = await MembershipModel.find({
      golferId: currentGolfer._id,
      status: "active",
    }).select("clubId");

    const clubIds = memberships.map(m => m.clubId);

    // Get all golfers from same clubs
    const clubMemberships = await MembershipModel.find({
      clubId: { $in: clubIds },
      status: "active",
    }).select("golferId");

    const golferIds = clubMemberships.map(m => m.golferId);

    // Geospatial query: find golfers near specified location
    const nearbyGolfers = await GolferModel.find({
      _id: { $in: golferIds, $ne: currentGolfer._id }, // Exclude self
      isLocationSharingEnabled: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(longitude as string), Number.parseFloat(latitude as string)],
          },
          $maxDistance: Number.parseInt(radius as string), // Radius in meters
        },
      },
      // locationUpdatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    })
      .select("fullName profileImage currentLocation locationUpdatedAt currentHole")
      .limit(50)
      .lean();

    // Calculate distances
    const locations = nearbyGolfers.map((golfer) => {
      const distance = calculateDistance(
        Number.parseFloat(latitude as string),
        Number.parseFloat(longitude as string),
        golfer.currentLocation.coordinates[1],
        golfer.currentLocation.coordinates[0],
      );

      return {
        golferId: golfer._id,
        fullName: golfer.fullName,
        profileImage: golfer.profileImage,
        location: {
          latitude: golfer.currentLocation.coordinates[1],
          longitude: golfer.currentLocation.coordinates[0],
        },
        currentHole: golfer.currentHole,
        lastUpdated: golfer.locationUpdatedAt,
        distanceMeters: Math.round(distance),
      };
    });

    return res.status(200).json({
      nearbyGolfersCount: locations.length,
      searchRadius: radius,
      locations,
    });
  }
  catch (error) {
    console.error("Error finding nearby golfers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a
    = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
      + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}






