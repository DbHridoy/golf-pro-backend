import type { Request, Response } from "express";

import EventModel from "../events/event.model";
import GameParticipationModel from "./game-participation.model";

// Get all participations for an event
export async function getEventParticipations(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    const filter: any = { eventId };
    if (status)
      filter.status = status;

    const participations = await GameParticipationModel.find(filter)
      .populate("playerId", "fullName profileImage handicapIndex")
      .populate("eventId", "eventName gameFormat")
      .populate("courseId", "courseName")
      .sort({ position: 1 });

    return res.status(200).json({
      participations,
      total: participations.length,
    });
  }
  catch (error) {
    console.error("Error fetching participations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get player's participation in specific event
export async function getPlayerParticipation(req: Request, res: Response) {
  try {
    const { eventId, playerId } = req.params;

    const participation = await GameParticipationModel.findOne({ eventId, playerId })
      .populate("playerId", "fullName profileImage handicapIndex")
      .populate("eventId", "eventName gameFormat eventDate")
      .populate("courseId", "courseName location")
      .populate("scorecardId");

    if (!participation) {
      return res.status(404).json({
        message: "Player is not registered for this event",
      });
    }

    return res.status(200).json({ participation });
  }
  catch (error) {
    console.error("Error fetching participation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all participations for a player (history)
export async function getPlayerHistory(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { playerId };
    if (status)
      filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const participations = await GameParticipationModel.find(filter)
      .populate("eventId", "eventName gameFormat eventDate clubId")
      .populate("courseId", "courseName location")
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await GameParticipationModel.countDocuments(filter);

    return res.status(200).json({
      participations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit),
      },
    });
  }
  catch (error) {
    console.error("Error fetching player history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update participation statistics (internal use)
export async function updateParticipationStats(req: Request, res: Response) {
  try {
    const { participationId } = req.params;
    const updates = req.body;

    const participation = await GameParticipationModel.findById(participationId);
    if (!participation) {
      return res.status(404).json({ message: "Participation not found" });
    }

    // Update allowed fields
    const allowedUpdates = [
      "finalScore",
      "netScore",
      "position",
      "totalPutts",
      "girPercentage",
      "firPercentage",
      "penalties",
      "birdies",
      "eagles",
      "albatrosses",
      "holesInOne",
      "status",
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        participation[key] = updates[key];
      }
    });

    await participation.save();

    return res.status(200).json({
      message: "Participation updated successfully",
      participation,
    });
  }
  catch (error) {
    console.error("Error updating participation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Leave event (before event starts)
export async function leaveEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const { playerId } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event hasn't started
    if (event.status !== "upcoming") {
      return res.status(400).json({
        message: "Cannot leave event that has already started",
      });
    }

    const participation = await GameParticipationModel.findOne({ eventId, playerId });
    if (!participation) {
      return res.status(404).json({ message: "Not registered for this event" });
    }

    // Remove from event participants
    event.participants = event.participants.filter(
      (p: { toString: () => any }) => p.toString() !== playerId.toString(),
    );
    event.currentParticipants -= 1;
    await event.save();

    // Delete participation record
    await GameParticipationModel.findByIdAndDelete(participation._id);

    return res.status(200).json({
      message: "Successfully left the event",
    });
  }
  catch (error) {
    console.error("Error leaving event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get player statistics summary
export async function getPlayerStatsSummary(req: Request, res: Response) {
  try {
    const { playerId } = req.params;

    const completedParticipations = await GameParticipationModel.find({
      playerId,
      status: "completed",
    });

    if (completedParticipations.length === 0) {
      return res.status(200).json({
        message: "No completed events found",
        stats: null,
      });
    }

    // Calculate aggregated statistics
    const totalEvents = completedParticipations.length;
    const totalBirdies = completedParticipations.reduce((sum, p) => sum + (p.birdies || 0), 0);
    const totalEagles = completedParticipations.reduce((sum, p) => sum + (p.eagles || 0), 0);
    const totalAlbatrosses = completedParticipations.reduce((sum, p) => sum + (p.albatrosses || 0), 0);
    const totalHolesInOne = completedParticipations.reduce((sum, p) => sum + (p.holesInOne || 0), 0);

    const avgScore = completedParticipations
      .filter(p => p.finalScore)
      .reduce((sum, p) => sum + p.finalScore!, 0) / totalEvents;

    const avgPutts = completedParticipations
      .filter(p => p.totalPutts)
      .reduce((sum, p) => sum + p.totalPutts!, 0) / totalEvents;

    const wins = completedParticipations.filter(p => p.position === 1).length;
    const topThreeFinishes = completedParticipations.filter(p => p.position && p.position <= 3).length;

    const stats = {
      totalEvents,
      wins,
      topThreeFinishes,
      averageScore: Math.round(avgScore * 10) / 10,
      averagePutts: Math.round(avgPutts * 10) / 10,
      totalBirdies,
      totalEagles,
      totalAlbatrosses,
      totalHolesInOne,
      bestFinish: Math.min(...completedParticipations.map(p => p.position || 999)),
    };

    return res.status(200).json({ stats });
  }
  catch (error) {
    console.error("Error fetching player stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
