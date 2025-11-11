import type { Request, Response } from "express";

import { joinEventRoom, leaveEventRoom } from "@/services/socket-service";

import EventModel from "../events/event.model";
import GameParticipationModel from "../gameParticipation/game-participation.model";
import GolferModel from "../golfer/golfer.model";
import { sendFCMNotification } from "../notifications/fcm.service";
import UserModel from "../user/user.model";
import ScorecardModel from "./scorecard.model";

/**
 * Update hole score - Called after each hole completion
 * Triggers real-time leaderboard update via FCM
 */

export async function updateHoleScore(req: Request, res: Response) {
  try {
    const { scorecardId } = req.params;
    const {
      holeNumber,
      strokes,
      putts,
      fairwayHit,
      greenInRegulation,
      penalties,
      sandSaves,
      chipIns,
    } = req.body;

    const userId = req.user!.userId;

    if (!holeNumber || holeNumber < 1 || holeNumber > 18) {
      return res.status(400).json({ message: "Invalid hole number" });
    }

    if (!strokes || strokes < 1 || strokes > 20) {
      return res.status(400).json({ message: "Invalid strokes count" });
    }

    if (putts !== undefined && (putts < 0 || putts > 10)) {
      return res.status(400).json({ message: "Invalid putts count" });
    }

    if (penalties !== undefined && (penalties < 0 || penalties > 10)) {
      return res.status(400).json({ message: "Invalid penalties count" });
    }

    const scorecard = await ScorecardModel.findById(scorecardId)
      .populate("playerId");

    if (!scorecard) {
      return res.status(404).json({ message: "Scorecard not found" });
    }

    // Verify ownership
    if (scorecard.playerId.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if round is in valid status
    if (scorecard.status === "completed" || scorecard.status === "invalidated") {
      return res.status(400).json({
        message: `Cannot update scorecard in ${scorecard.status} status`,
      });
    }

    // Find hole
    const holeIndex = scorecard.holes.findIndex((h: { holeNumber: number }) => h.holeNumber === holeNumber);
    if (holeIndex === -1) {
      return res.status(404).json({ message: "Hole not found" });
    }

    const hole = scorecard.holes[holeIndex];
    const par = hole.par;

    // Update hole data
    hole.strokes = strokes;
    hole.putts = putts || 0;
    hole.fairwayHit = (par >= 4 && par <= 5) ? (fairwayHit ?? null) : null;
    hole.greenInRegulation = greenInRegulation || false;
    hole.penalties = penalties || 0;
    hole.sandSaves = sandSaves || 0;
    hole.chipIns = chipIns || 0;
    hole.completedAt = new Date();

    // Calculate score relative to par
    const scoreToPar = strokes - par;

    // Determine achievements
    hole.isAlbatross = scoreToPar <= -3;
    hole.isHoleInOne = (par === 3 && strokes === 1);
    hole.isEagle = scoreToPar === -2;
    hole.isBirdie = scoreToPar === -1;
    hole.isPar = scoreToPar === 0;
    hole.isBogey = scoreToPar === 1;
    hole.isDoubleBogeyOrWorse = scoreToPar >= 2;

    // Apply ESC (Equitable Stroke Control) for handicap calculation
    hole.adjustedStrokes = applyESC(strokes, par, scorecard.handicapUsed || 0);

    // ===== NEW: UPDATE CURRENT HOLE IN GOLFER PROFILE =====
    await GolferModel.findByIdAndUpdate(scorecard.playerId._id, {
      currentHole: holeNumber,
      lastActiveAt: new Date(),
    });

    // Update scorecard status
    if (scorecard.status === "not_started") {
      scorecard.status = "in_progress";
      scorecard.startedAt = new Date();
    }

    // Update online status
    scorecard.lastOnlineAt = new Date();
    scorecard.isPlayerOnline = true;

    // Recalculate totals
    recalculateScorecardTotals(scorecard);

    // Check if round is complete (all 18 holes)
    const completedHoles = scorecard.holes.filter((h: Hole) => h.strokes > 0).length;
    if (completedHoles === 18) {
      scorecard.status = "completed";
      scorecard.completedAt = new Date();
    }
    // ===== NEW: CLEAR CURRENT EVENT =====
    await GolferModel.findByIdAndUpdate(scorecard.playerId._id, {
      currentEventId: null,
      currentHole: null,
    });

    scorecard.lastHoleCompletedAt = new Date();
    await scorecard.save();

    // Update GameParticipation
    await updateGameParticipation(scorecard);

    // Update live leaderboard
    await updateLiveLeaderboard(scorecard.eventId);

    // Send FCM notification to all event participants
    await broadcastLeaderboardUpdate(scorecard.eventId);

    return res.status(200).json({
      message: "Hole score updated successfully",
      scorecard: {
        id: scorecard._id,
        holeNumber,
        strokes,
        scoreToPar,
        totalGrossScore: scorecard.totalGrossScore,
        totalNetScore: scorecard.totalNetScore,
        completedHoles,
        status: scorecard.status,
      },
    });
  }
  catch (error) {
    console.error("Error updating hole score:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

interface Hole {
  holeNumber: number;
  strokes: number;
  putts?: number;
  fairwayHit?: boolean | null;
  greenInRegulation?: boolean;
  penalties?: number;
  sandSaves?: number;
  chipIns?: number;
  par?: number;
  isAlbatross?: boolean;
  isHoleInOne?: boolean;
  isEagle?: boolean;
  isBirdie?: boolean;
  isPar?: boolean;
  isBogey?: boolean;
  isDoubleBogeyOrWorse?: boolean;
  adjustedStrokes?: number;
  completedAt?: Date;
}

/**
 * Apply Equitable Stroke Control (ESC) for handicap calculation
 * Limits maximum score per hole based on handicap
 */
function applyESC(strokes: number, par: number, handicapIndex: number): number {
  let maxScore: number;

  if (handicapIndex <= 9) {
    maxScore = par + 2; // Double bogey
  }
  else if (handicapIndex <= 19) {
    maxScore = 7;
  }
  else if (handicapIndex <= 29) {
    maxScore = 8;
  }
  else if (handicapIndex <= 39) {
    maxScore = 9;
  }
  else {
    maxScore = 10;
  }

  return Math.min(strokes, maxScore);
}

/**
 * Recalculate scorecard totals
 */
function recalculateScorecardTotals(scorecard: any) {
  let totalGross = 0;
  let totalAdjusted = 0;
  let totalPutts = 0;
  let totalPenalties = 0;
  let fairwaysHit = 0;
  let fairwaysTotal = 0;
  let greensInReg = 0;
  let eagles = 0;
  let birdies = 0;
  let pars = 0;
  let bogeys = 0;
  let doubleBogeys = 0;
  let holesInOne = 0;
  let albatrosses = 0;
  let sandSaves = 0;

  scorecard.holes.forEach((hole: Hole) => {
    if (hole.strokes > 0) {
      totalGross += hole.strokes;
      totalAdjusted += hole.adjustedStrokes || hole.strokes;
      totalPutts += hole.putts || 0;
      totalPenalties += hole.penalties || 0;

      if (hole.fairwayHit !== null) {
        fairwaysTotal++;
        if (hole.fairwayHit)
          fairwaysHit++;
      }

      if (hole.greenInRegulation)
        greensInReg++;
      if (hole.isAlbatross)
        albatrosses++;
      if (hole.isHoleInOne)
        holesInOne++;
      if (hole.isEagle)
        eagles++;
      if (hole.isBirdie)
        birdies++;
      if (hole.isPar)
        pars++;
      if (hole.isBogey)
        bogeys++;
      if (hole.isDoubleBogeyOrWorse)
        doubleBogeys++;
      if (hole.sandSaves)
        sandSaves += hole.sandSaves;
    }
  });

  // Calculate front 9 and back 9
  scorecard.front9Score = scorecard.holes
    .filter((h: Hole) => h.holeNumber <= 9 && h.strokes > 0)
    .reduce((sum: number, h: Hole) => sum + h.strokes, 0);

  scorecard.back9Score = scorecard.holes
    .filter((h: Hole) => h.holeNumber > 9 && h.strokes > 0)
    .reduce((sum: number, h: Hole) => sum + h.strokes, 0);

  scorecard.totalGrossScore = totalGross;
  scorecard.adjustedGrossScore = totalAdjusted;
  scorecard.totalNetScore = totalGross - (scorecard.playingHandicap || 0);
  scorecard.totalPutts = totalPutts;
  scorecard.totalPenalties = totalPenalties;
  scorecard.fairwaysHit = fairwaysHit;
  scorecard.fairwaysTotal = fairwaysTotal;
  scorecard.greensInRegulation = greensInReg;
  scorecard.eagles = eagles;
  scorecard.birdies = birdies;
  scorecard.pars = pars;
  scorecard.bogeys = bogeys;
  scorecard.doubleBogeys = doubleBogeys;
  scorecard.holesInOne = holesInOne;
  scorecard.albatrosses = albatrosses;
  scorecard.sandSaves = sandSaves;
}

/**
 * Update GameParticipation with final scores and stats
 */
async function updateGameParticipation(scorecard: any) {
  const completedHoles = scorecard.holes.filter((h: any) => h.strokes > 0).length;

  // Calculate par for completed holes
  const coursePar = scorecard.holes.reduce((sum: number, h: any) => sum + h.par, 0); // Should be 72 typically
  const scoreToPar = scorecard.totalGrossScore - coursePar;

  const firPercentage = scorecard.fairwaysTotal > 0
    ? (scorecard.fairwaysHit / scorecard.fairwaysTotal) * 100
    : 0;

  const girPercentage = (scorecard.greensInRegulation / 18) * 100;

  await GameParticipationModel.findByIdAndUpdate(
    scorecard.gameParticipationId,
    {
      finalScore: scorecard.totalGrossScore,
      netScore: scorecard.totalNetScore,
      scoreToPar, // added as new field
      thru: completedHoles === 18 ? "F" : completedHoles, // added as new field
      handicapUsed: scorecard.handicapUsed,
      totalPutts: scorecard.totalPutts,
      girPercentage: Math.round(girPercentage),
      firPercentage: Math.round(firPercentage),
      penalties: scorecard.totalPenalties,
      birdies: scorecard.birdies,
      eagles: scorecard.eagles,
      albatrosses: scorecard.albatrosses,
      holesInOne: scorecard.holesInOne,
      status: scorecard.status === "completed" ? "completed" : "playing",
      playedAt: scorecard.completedAt || new Date(),
    },
  );
}

/**
 * Update live leaderboard for event
 */
async function updateLiveLeaderboard(eventId: any) {
  const participations = await GameParticipationModel.find({
    eventId,
    status: { $in: ["playing", "completed"] },
  })
    .populate("playerId", "fullName profileImage")
    .sort({ netScore: 1, finalScore: 1 })
    .lean();

  let currentPosition = 1;
  let previousScore: number | null = null;
  let playersAtPosition = 0;

  for (let i = 0; i < participations.length; i++) {
    const participation = participations[i];

    // If score is same as previous, keep same position
    if (previousScore !== null && participation.netScore === previousScore) {
      participation.position = currentPosition;
      playersAtPosition++;
    }
    else {
      // New score, update position
      currentPosition += playersAtPosition;
      participation.position = currentPosition;
      playersAtPosition = 1;
    }

    previousScore = participation.netScore;

    // Save position
    await GameParticipationModel.findByIdAndUpdate(
      participation._id,
      { position: participation.position },
    );
  }

  // Update event leaderboard
  const leaderboardIds = participations.map(p => p._id);
  await EventModel.findByIdAndUpdate(eventId, {
    leaderboard: leaderboardIds,
  });
}

/**
 * Broadcast leaderboard update via FCM to all event participants
 */
async function broadcastLeaderboardUpdate(eventId: any) {
  try {
    // Get all participants' user IDs
    const participations = await GameParticipationModel.find({ eventId })
      .populate({
        path: "playerId",
        select: "userId",
      });

    const userIds = participations
      .map(p => p.playerId.userId)
      .filter(Boolean);

    // Get FCM tokens from users
    const users = await UserModel.find({
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: null },
    }).select("fcmToken");

    const fcmTokens = users.map(u => u.fcmToken).filter(Boolean);

    if (fcmTokens.length > 0) {
      await sendFCMNotification(fcmTokens, {
        title: "Leaderboard Updated",
        body: "Live scores have been updated!",
        data: {
          type: "leaderboard_update",
          eventId: eventId.toString(),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
  catch (error) {
    console.error("Error broadcasting leaderboard update:", error);
  }
}

/**
 * Get live leaderboard for event
 */
export async function getLiveLeaderboard(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId).populate({
      path: "leaderboard",
      populate: {
        path: "playerId",
        select: "fullName profileImage",
        populate: {
          path: "userId",
          select: "handicapIndex",
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      eventName: event.eventName,
      status: event.status,
      leaderboard: event.leaderboard,
    });
  }
  catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// start round
export async function startRound(req: Request, res: Response) {
  try {
    const { scorecardId } = req.params;
    const userId = req.user!.userId;

    const scorecard = await ScorecardModel.findById(scorecardId).populate("playerId");

    if (!scorecard) {
      return res.status(404).json({ message: "Scorecard not found" });
    }

    // Verify ownership
    if (scorecard.playerId.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if already started
    if (scorecard.status !== "not_started") {
      return res.status(400).json({
        message: `Round already ${scorecard.status}`,
      });
    }

    // Start the round
    scorecard.status = "in_progress";
    scorecard.startedAt = new Date();
    scorecard.lastOnlineAt = new Date();
    scorecard.isPlayerOnline = true;
    await scorecard.save();

    // Update GameParticipation status
    await GameParticipationModel.findByIdAndUpdate(
      scorecard.gameParticipationId,
      { status: "playing" },
    );

    // ===== NEW: SET CURRENT EVENT IN GOLFER PROFILE =====
    await GolferModel.findByIdAndUpdate(scorecard.playerId._id, {
      currentEventId: scorecard.eventId,
      currentHole: 1, // Starting at hole 1
      isLocationSharingEnabled: true, // Ensure location sharing is enabled
    });

    // ===== NEW: Join event room for real-time location updates =====
    joinEventRoom(userId, scorecard.eventId.toString());

    return res.status(200).json({
      message: "Round started successfully",
      scorecard: {
        id: scorecard._id,
        status: scorecard.status,
        startedAt: scorecard.startedAt,
        holes: scorecard.holes.map((h: any) => ({
          holeNumber: h.holeNumber,
          par: h.par,
          strokeIndex: h.strokeIndex,
          length: h.length,
        })),
      },
    });
  }
  catch (error) {
    console.error("Error starting round:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ===== ADD: Function to complete round and leave event room =====
export async function completeRound(req: Request, res: Response) {
  try {
    const { scorecardId } = req.params;
    const userId = req.user!.userId;

    const scorecard = await ScorecardModel.findById(scorecardId)
      .populate("playerId");

    if (!scorecard) {
      return res.status(404).json({ message: "Scorecard not found" });
    }

    if (scorecard.status !== "in_progress") {
      return res.status(400).json({
        message: "Round is not in progress",
      });
    }

    scorecard.status = "completed";
    scorecard.completedAt = new Date();
    await scorecard.save();

    await updateGameParticipation(scorecard);
    await updateLiveLeaderboard(scorecard.eventId);

    // ===== NEW: Leave event room and clear current event =====
    leaveEventRoom(userId, scorecard.eventId.toString());

    await GolferModel.findByIdAndUpdate(scorecard.playerId._id, {
      currentEventId: null,
      currentHole: null,
    });

    return res.status(200).json({
      message: "Round completed successfully",
      scorecard: {
        id: scorecard._id,
        status: scorecard.status,
        completedAt: scorecard.completedAt,
      },
    });
  }
  catch (error) {
    console.error("Error completing round:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
