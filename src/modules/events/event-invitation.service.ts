import type { Request, Response } from "express";

import { getTeeRatingsForGender, selectDefaultTeeForGolfer } from "@/services/tee-selection.service";

import CourseModel from "../courses/course.model";
import GameParticipationModel from "../gameParticipation/game-participation.model";
import GolferModel from "../golfer/golfer.model";
import ScorecardModel from "../scorecards/scorecard.model";
import UserModel from "../user/user.model";
import EventInvitationModel from "./event-invitation.model";
import EventModel from "./event.model";

export async function acceptEventInvitation(req: Request, res: Response) {
  try {
    const { invitationId } = req.params;
    const userId = req.user!.userId;

    // Find invitation
    const invitation = await EventInvitationModel.findById(invitationId)
      .populate("eventId")
      .populate("golferId");

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Verify user owns this golfer profile
    if (invitation.golferId.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if already accepted
    if (invitation.invitationStatus === "accepted") {
      return res.status(400).json({ message: "Invitation already accepted" });
    }

    // Check if invitation expired
    if (new Date() > invitation.expiresAt) {
      invitation.invitationStatus = "expired";
      await invitation.save();
      return res.status(400).json({ message: "Invitation has expired" });
    }

    // Check if event is full
    const event = await EventModel.findById(invitation.eventId._id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get user's current handicap
    const user = await UserModel.findById(userId);
    const currentHandicap = user?.handicapIndex || 0;

    // Get course details with tee box information
    const course = await CourseModel.findById(event.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Determine gender from golfer profile
    const golfer = await GolferModel.findById(invitation.golferId._id);
    const gender = golfer?.gender === "female" ? "female" : "male";

    // automatic tee selection based on gender and handicap
    let selectedTee: any;
    try {
      selectedTee = selectDefaultTeeForGolfer(course, gender, currentHandicap);
    }
    catch (error: any) {
      return res.status(400).json({
        message: error.message,
        availableTees: course.tees.map((t: any) => ({
          teeID: t.teeID,
          teeName: t.teeName,
          teeColor: t.teeColor,
        })),
      });
    }

    // // Find selected tee box by teeID
    // const teeBox = course.tees.find((tee: {
    //   teeID: string;
    //   teeName?: string;
    //   teeColor?: string;
    //   holeLengths?: number[];
    //   courseRatingMen?: number;
    //   slopeMen?: number;
    //   courseRatingWomen?: number;
    //   slopeWomen?: number;
    // }) => selectedTeeIDs.includes(tee.teeID));

    // if (!teeBox) {
    //   return res.status(400).json({
    //     message: `Tee box with ID "${selectedTeeIDs}" not found`,
    //     availableTees: course.tees.map((t: { teeID: string; teeName?: string; teeColor?: string }) => ({
    //       teeID: t.teeID,
    //       teeName: t.teeName,
    //       teeColor: t.teeColor,
    //     })),
    //   });
    // }

    // Get ratings for selected tee
    const { courseRating, slopeRating } = getTeeRatingsForGender(selectedTee, gender);

    // Calculate Playing Handicap
    const playingHandicap = Math.round(currentHandicap * (slopeRating / 113));

    // Create GameParticipation
    const gameParticipation = await GameParticipationModel.create({
      eventId: event._id,
      playerId: invitation.golferId._id,
      courseId: course._id,
      handicapUsed: currentHandicap,
      status: "registered",
    });

    // Get appropriate pars and indexes based on gender
    const pars = gender === "male" ? course.parsMen : course.parsWomen;
    const indexes = gender === "male" ? course.indexesMen : course.indexesWomen;

    // Validate ratings exist
    if (!courseRating || !slopeRating) {
      return res.status(400).json({
        message: `Course rating and slope not available for ${gender} golfers on tee "${teeBox.teeName}"`,
      });
    }

    // Initialize Scorecard with hole data
    const holes = pars.map((par: number, index: number) => ({
      holeNumber: index + 1,
      par,
      strokeIndex: indexes[index],
      length: selectedTee.holeLengths[index] || 0,
      strokes: 0,
      putts: 0,
      fairwayHit: null,
      greenInRegulation: false,
      penalties: 0,
      sandSaves: 0,
      chipIns: 0,
    }));

    // // Calculate Playing Handicap (Course Handicap)
    // // Formula: Handicap Index × (Slope Rating / 113)
    // const playingHandicap = Math.round(currentHandicap * (slopeRating / 113));

    // // Create GameParticipation
    // const gameParticipation = await GameParticipationModel.create({
    //   eventId: event._id,
    //   playerId: invitation.golferId._id,
    //   courseId: course._id,
    //   handicapUsed: currentHandicap,
    //   status: "registered",
    // });

    // Get appropriate pars and indexes based on gender
    // const pars = gender === "male" ? course.parsMen : course.parsWomen;
    // const indexes = gender === "male" ? course.indexesMen : course.indexesWomen;

    // Initialize Scorecard with hole data
    // const holes = pars.map((par: number, index: number) => ({
    //   holeNumber: index + 1,
    //   par,
    //   strokeIndex: indexes[index],
    //   length: teeBox.holeLengths[index] || 0,
    //   strokes: 0,
    //   putts: 0,
    //   fairwayHit: null,
    //   greenInRegulation: false,
    //   penalties: 0,
    //   sandSaves: 0,
    //   chipIns: 0,
    // }));

    const scorecard = await ScorecardModel.create({
      eventId: event._id,
      gameParticipationId: gameParticipation._id,
      playerId: invitation.golferId._id,
      courseId: course._id,
      selectedTeeID: selectedTee.teeID,
      selectedTeeName: selectedTee.teeName,
      selectedTeeColor: selectedTee.teeColor,
      gender,
      courseRating,
      slopeRating,
      handicapUsed: currentHandicap,
      playingHandicap,
      holes,
      status: "not_started",
    });

    // Update GameParticipation with scorecard reference
    gameParticipation.scorecardId = scorecard._id;
    await gameParticipation.save();

    // Update invitation status
    invitation.invitationStatus = "accepted";
    invitation.respondedAt = new Date();
    await invitation.save();

    // Increment event participant count
    event.currentParticipants += 1;
    await event.save();

    return res.status(200).json({
      message: "Invitation accepted successfully",
      gameParticipation,
      scorecard: {
        id: scorecard._id,
        selectedTeeID: selectedTee.teeID,
        selectedTeeName: selectedTee.teeName,
        selectedTeeColor: selectedTee.teeColor,
        gender,
        courseRating,
        slopeRating,
        playingHandicap,
        holes: scorecard.holes.length,
        status: scorecard.status,
      },
      autoAssignedTee: {
        teeID: selectedTee.teeID,
        teeName: selectedTee.teeName,
        teeColor: selectedTee.teeColor,
        totalLength: selectedTee.totalLength,
        courseRating,
        slopeRating,
        reason: `Automatically assigned based on ${gender} gender${currentHandicap ? ` and ${currentHandicap} handicap` : ""}`,
      },
    });
  }
  catch (error) {
    console.error("Error accepting invitation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
/**
 * Decline event invitation
 */
export async function declineEventInvitation(req: Request, res: Response) {
  try {
    const { invitationId } = req.params;
    const userId = req.user!.userId;

    const invitation = await EventInvitationModel.findById(invitationId)
      .populate("golferId");

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.golferId.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    invitation.invitationStatus = "declined";
    invitation.respondedAt = new Date();
    await invitation.save();

    return res.status(200).json({ message: "Invitation declined" });
  }
  catch (error) {
    console.error("Error declining invitation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
