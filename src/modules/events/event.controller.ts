import type { Request, Response } from "express";

import { env } from "@/env.js";
import { logger } from "@/middlewares/pino-logger.js";

import { broadcastEventStatus } from "../../services/websocket-service.js";
import ClubModel from "../club/club.model.js";
import CourseModel from "../courses/course.model.js";
import GameParticipationModel from "../gameParticipation/game-participation.model.js";
import GolferModel from "../golfer/golfer.model.js";
import MembershipModel from "../memberships/memberships.model.js";
import NotificationModel from "../notification/notification.model.js";
import EventInvitationModel from "./event-invitation.model.js";
import EventModel from "./event.model";

// Create new event (Club/Admin only)
export async function createEvent(req: Request, res: Response) {
  try {
    const {
      clubId,
      courseID,
      eventDate,
      eventTime,
      gameFormat,
      registrationDeadline,
      selectedGolfers,
    } = req.body;

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // ============================================
    // 1. AUTHORIZATION CHECK
    // ============================================
    if (userRole !== "golf_club" && userRole !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only clubs and admins can create events.",
      });
    }

    // ============================================
    // 2. VALIDATION
    // ============================================

    // Validate required fields
    if (!courseID || !eventDate || !eventTime || !gameFormat) {
      return res.status(400).json({
        message: "Missing required fields: courseId, eventDate, eventTime, gameFormat",
      });
    }

    // Validate selected golfers
    if (!selectedGolfers || !Array.isArray(selectedGolfers) || selectedGolfers.length < 2) {
      return res.status(400).json({
        message: "Please select at least two club member to invite to the event.",
      });
    }

    // Check if event date is in the future
    const eventDateTime = new Date(eventDate);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({
        message: "Event date must be in the future",
      });
    }

    // ============================================
    // 3. VERIFY CLUB OWNERSHIP (if clubId provided)
    // ============================================

    let golfClubInfo: any = null;

    if (clubId) {
      if (userRole === "golf_club") {
        golfClubInfo = await ClubModel.findOne({ _id: clubId, userId });

        if (!golfClubInfo) {
          return res.status(403).json({
            message: "You can only create events for your own club",
          });
        }
      }
      else if (userRole === "admin") {
        const club = await ClubModel.findById(clubId);
        if (!club) {
          return res.status(404).json({ message: "Club not found" });
        }
      }
    }

    // ============================================
    // 4. VERIFY COURSE EXISTS
    // ============================================
    let course = await CourseModel.findOne({ courseID });

    if (!course) {
      // Fetch from external API
      try {
        const apiUrl = `https://www.golfapi.io/api/v2.3/courses/${courseID}`;

        const courseApiResponse = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${env.GOLF_API_KEY}`, // ✅ Add your API key
            "Content-Type": "application/json",
          },
        });

        if (!courseApiResponse.ok) {
          return res.status(404).json({
            message: "Course not found in external API",
          });
        }

        const courseData = await courseApiResponse.json();

        // ✅ Transform API response to match our Course model
        const tees = courseData.tees.map((tee: any) => {
          // Extract hole lengths from length1 to length18
          const holeLengths = [];
          for (let i = 1; i <= 18; i++) {
            holeLengths.push(tee[`length${i}`]);
          }

          // Calculate total length
          const totalLength = holeLengths.reduce((sum: number, len: number) => sum + len, 0);

          return {
            teeID: tee.teeID,
            teeName: tee.teeName,
            teeColor: tee.teeColor || null,
            holeLengths,
            courseRatingMen: tee.courseRatingMen || null,
            slopeMen: tee.slopeMen || null,
            courseRatingMenFront9: tee.courseRatingMenFront9 || null,
            courseRatingMenBack9: tee.courseRatingMenBack9 || null,
            slopeMenFront9: tee.slopeMenFront9 || null,
            slopeMenBack9: tee.slopeMenBack9 || null,
            courseRatingWomen: tee.courseRatingWomen || null,
            slopeWomen: tee.slopeWomen || null,
            courseRatingWomenFront9: tee.courseRatingWomenFront9 || null,
            courseRatingWomenBack9: tee.courseRatingWomenBack9 || null,
            slopeWomenFront9: tee.slopeWomenFront9 || null,
            slopeWomenBack9: tee.slopeWomenBack9 || null,
            totalLength,
          };
        });

        // Create course in database
        course = await CourseModel.create({
          courseID: courseData.courseID,
          clubID: courseData.clubID,
          clubName: courseData.clubName,
          courseName: courseData.courseName,
          location: {
            address: courseData.address || null,
            postalCode: courseData.postalCode || null,
            city: courseData.city || null,
            state: courseData.state || null,
            country: courseData.country || null,
            latitude: courseData.latitude || null,
            longitude: courseData.longitude || null,
          },
          website: courseData.website || null,
          telephone: courseData.telephone || null,
          numHoles: Number.parseInt(courseData.numHoles) || 18,
          measure: courseData.measure || "m",
          hasGPS: courseData.hasGPS === "1" || courseData.hasGPS === 1,
          parsMen: courseData.parsMen || [],
          indexesMen: courseData.indexesMen || [],
          parsWomen: courseData.parsWomen || [],
          indexesWomen: courseData.indexesWomen || [],
          numTees: courseData.numTees || courseData.tees?.length || 0,
          tees,
          timestampUpdated: courseData.timestampUpdated,
          lastSyncedAt: new Date(),
          oldCourseIDs: courseData.oldCourseIDs || [],
        });

        console.log(`✅ Course created: ${course.courseName} (${course.courseID})`);
      }
      catch (apiError) {
        console.error("Error fetching course from API:", apiError);
        return res.status(500).json({
          message: "Failed to fetch course data from external API",
          error: apiError,
        });
      }
    }
    else {
      console.log(`✅ Course found in database: ${course.courseName}`);
    }

    // ============================================
    // 5. VERIFY ALL SELECTED GOLFERS ARE CLUB MEMBERS
    // ============================================

    // if (clubId) {
    //   const memberships = await MembershipModel.find({
    //     clubId,
    //     golferId: { $in: selectedGolfers },
    //     status: "active",
    //   });

    //   if (memberships.length !== selectedGolfers.length) {
    //     const validGolferIds = memberships.map(m => m.golferId.toString());
    //     const invalidGolfers = selectedGolfers.filter(
    //       id => !validGolferIds.includes(id.toString()),
    //     );

    //     return res.status(400).json({
    //       message: "Some selected golfers are not active members of this club",
    //       invalidGolferIds: invalidGolfers,
    //     });
    //   }
    // }

    // ============================================
    // 6. CREATE EVENT
    // ============================================
    const event = await EventModel.create({
      eventName: golfClubInfo?.clubName || "Golf Event",
      clubId: clubId || null,
      createdBy: userId,
      courseId: course._id, // ✅ Use MongoDB _id for internal reference
      eventDate: eventDateTime,
      eventTime,
      gameFormat,
      currentParticipants: 0,
      registrationDeadline: registrationDeadline || eventDateTime,
      status: "upcoming",
      leaderboard: [],
      brackets: [],
    });

    // ============================================
    // 7. CREATE EVENT INVITATIONS FOR SELECTED GOLFERS
    // ============================================
    const invitations = selectedGolfers.map(golferId => ({
      eventId: event._id,
      golferId,
      invitedBy: userId,
      invitationStatus: "pending",
      invitedAt: new Date(),
      expiresAt: eventDateTime,
    }));

    logger.info("----------------------");
    logger.info(invitations, "GOLFER INFORMATION");

    const createdInvitations = await EventInvitationModel.insertMany(invitations);

    // ============================================
    // 8. CREATE NOTIFICATIONS FOR INVITED GOLFERS
    // ============================================
    const golfers = await GolferModel.find({
      _id: { $in: selectedGolfers },
    }).select("userId fullName");

    const notifications = golfers.map(golfer => ({
      recipientId: golfer.userId,
      type: "event_invitation",
      title: "New Event Invitation",
      message: `You have been invited to participate in "${golfClubInfo?.clubName || "Golf Event"}" at ${course.courseName}`,
      relatedEntityType: "Event",
      relatedEntityId: event._id,
      isRead: false,
    }));

    await NotificationModel.insertMany(notifications);
    // TODO: Send push notifications or emails here
    // await sendPushNotification(golferUserIds, notificationData);
    // await sendEmailNotifications(golferEmails, eventDetails);

    // ============================================
    // 9. POPULATE AND RETURN EVENT DATA
    // ============================================
    const populatedEvent = await EventModel.findById(event._id)
      .populate("clubId", "clubName city country clubProfileImage")
      .populate("createdBy", "fullName email role")
      .populate("courseId", "courseName clubName location courseID numHoles measure tees");

    // Get invitation details with golfer info
    const invitationsWithGolfers = await EventInvitationModel.find({
      eventId: event._id,
    })
      .populate({
        path: "golferId",
        select: "fullName profileImage userId",
        populate: {
          path: "userId",
          select: "handicapIndex",
        },
      })
      .lean();

    return res.status(201).json({
      message: "Event created successfully and invitations sent to selected golfers",
      event: populatedEvent,
      course: {
        courseID: course.courseID,
        courseName: course.courseName,
        clubName: course.clubName,
        city: course.location.city,
        country: course.location.country,
        numHoles: course.numHoles,
        measure: course.measure,
        availableTees: course.tees.map((t: any) => ({
          teeID: t.teeID,
          teeName: t.teeName,
          teeColor: t.teeColor,
          totalLength: t.totalLength,
        })),
      },
      invitations: invitationsWithGolfers.map(inv => ({
        invitationId: inv._id,
        golfer: inv.golferId,
        status: inv.invitationStatus,
        invitedAt: inv.invitedAt,
        expiresAt: inv.expiresAt,
      })),
      stats: {
        totalInvited: createdInvitations.length,
        pendingResponses: createdInvitations.length,
        acceptedCount: 0,
        declinedCount: 0,
      },
    });
  }
  catch (error) {
    console.error("Error creating event:", error);

    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          details: error.message,
        });
      }
      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid ID format provided",
        });
      }
    }

    return res.status(500).json({
      message: "Internal server error while creating event",
    });
  }
}

// Get all events (with filters)
export async function getAllEvents(req: Request, res: Response) {
  try {
    const { status, gameFormat, clubId, isPublic, page = 1, limit = 10 } = req.query;

    const filter: any = {};

    if (status)
      filter.status = status;
    if (gameFormat)
      filter.gameFormat = gameFormat;
    if (clubId)
      filter.clubId = clubId;
    if (isPublic !== undefined)
      filter.isPublic = isPublic === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const events = await EventModel.find(filter)
      .populate("clubId", "clubName city country clubProfileImage")
      .populate("createdBy", "fullName email")
      .populate("courseId", "courseName location")
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const totalEvents = await EventModel.countDocuments(filter);

    return res.status(200).json({
      events,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalEvents / Number(limit)),
        totalEvents,
        eventsPerPage: Number(limit),
      },
    });
  }
  catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get single event by ID
export async function getEventById(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId)
      .populate("clubId", "clubName city country clubProfileImage")
      .populate("createdBy", "fullName email role")
      .populate("courseId", "courseName location rating slope")
      .populate({
        path: "participants",
        select: "fullName profileImage handicapIndex",
      });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ event });
  }
  catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update event (Club/Admin only - must be creator or admin)
export async function updateEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find event
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Authorization check
    const isCreator = event.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied. Only event creator or admin can update this event.",
      });
    }

    // Prevent status change if event is active/completed
    if (updates.status && event.status === "active") {
      return res.status(400).json({
        message: "Cannot modify status of active event. Complete or cancel first.",
      });
    }

    // Prevent changing game format if participants exist
    if (updates.gameFormat && event.currentParticipants > 0) {
      return res.status(400).json({
        message: "Cannot change game format after participants have joined.",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "eventName",
      "eventDate",
      "eventTime",
      "description",
      "isPublic",
      "prizePool",
      "registrationDeadline",
      "status",
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        event[key] = updates[key];
      }
    });

    await event.save();

    const updatedEvent = await EventModel.findById(eventId)
      .populate("clubId", "clubName")
      .populate("courseId", "courseName");

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  }
  catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Delete event (Club/Admin only - must be creator or admin)
export async function deleteEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Authorization check
    const isCreator = event.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied. Only event creator or admin can delete this event.",
      });
    }

    // Prevent deletion if event is active
    if (event.status === "active") {
      return res.status(400).json({
        message: "Cannot delete active event. Please cancel or complete it first.",
      });
    }

    // Delete associated game participations
    await GameParticipationModel.deleteMany({ eventId });

    // Delete event
    await EventModel.findByIdAndDelete(eventId);

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  }
  catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Join event (Golfer only)
export async function joinEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const { golferId } = req.body;
    // const userId = req.user._id;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is upcoming
    if (event.status !== "upcoming") {
      return res.status(400).json({ message: "Cannot join event that is not upcoming" });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Check if already joined
    if (event.participants.includes(golferId)) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    // Add participant for live broadcast
    // event.participants.push(golferId);
    // event.currentParticipants += 1;
    // await event.save();

    // Create GameParticipation record
    const participation = await GameParticipationModel.create({
      eventId,
      playerId: golferId,
      courseId: event.courseId,
      status: "registered",
    });

    // Broadcast participant joined (NEW)
    // const golfer = await GolferModel.findById(golferId).select("fullName profileImage");
    // await broadcastParticipantJoined(eventId, {
    //   playerId: golferId,
    //   playerName: golfer?.fullName,
    //   profileImage: golfer?.profileImage,
    // });

    return res.status(200).json({
      message: "Successfully joined event",
      event,
      participation,
    });
  }
  catch (error) {
    console.error("Error joining event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Start event (Club/Admin only)
export async function startEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Authorization check
    const isCreator = event.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied. Only event creator or admin can start this event.",
      });
    }

    // Validation
    if (event.status !== "upcoming") {
      return res.status(400).json({ message: "Event is not in upcoming status" });
    }

    if (event.currentParticipants < 2) {
      return res.status(400).json({ message: "Need at least 2 participants to start event" });
    }

    // Update status
    event.status = "active";
    await event.save();

    // Broadcast event started
    await broadcastEventStatus(eventId, "active");

    return res.status(200).json({
      message: "Event started successfully",
      event,
    });
  }
  catch (error) {
    console.error("Error starting event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Complete event (Club/Admin only)
export async function completeEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Authorization check
    const isCreator = event.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    if (event.status !== "active") {
      return res.status(400).json({ message: "Event is not active" });
    }

    // Update status
    event.status = "completed";
    await event.save();

    // Broadcast event completed
    await broadcastEventStatus(eventId, "completed");

    return res.status(200).json({
      message: "Event completed successfully",
      event,
    });
  }
  catch (error) {
    console.error("Error completing event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
