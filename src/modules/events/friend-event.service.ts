import type { Request, Response } from "express";

import { logger } from "@/middlewares/pino-logger";
import { getTeeRatingsForGender, selectDefaultTeeForGolfer } from "@/services/tee-selection.service";

import CourseModel from "../courses/course.model";
import FriendModel from "../friends/friends.model";
import GameParticipationModel from "../gameParticipation/game-participation.model";
import GolferModel from "../golfer/golfer.model";
import NotificationModel from "../notification/notification.model";
import ScorecardModel from "../scorecards/scorecard.model";
import UserModel from "../user/user.model";
import EventInvitationModel from "./event-invitation.model";
import EventModel from "./event.model";

/**
 * Fetch course from third-party API or local database
 * Implements the same hybrid approach as event.controller.ts
 */
async function getCourseData(courseID: string) {
  try {
    // ✅ Step 1: Check local database first (cache)
    let course = await CourseModel.findOne({ courseID });

    if (course) {
      logger.info(`✅ Course found in local database: ${course.courseName}`);
      return course;
    }

    // ✅ Step 2: Fetch from third-party API if not in database
    logger.info(`📡 Fetching course from Golf API: ${courseID}`);

    const apiUrl = `https://www.golfapi.io/api/v2.3/courses/${courseID}`;

    const courseApiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.GOLF_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!courseApiResponse.ok) {
      throw new Error(`Golf API returned status ${courseApiResponse.status}`);
    }

    const courseData = await courseApiResponse.json();

    // ✅ Step 3: Transform API response to tee boxes
    const tees = courseData.tees.map((tee: any) => {
      const holeLengths = [];

      // Extract hole lengths from API response
      for (let i = 1; i <= 18; i++) {
        holeLengths.push(tee[`length${i}`] || 0);
      }

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

    // ✅ Step 4: Save to local database for future use
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

    logger.info(`✅ Course saved to database: ${course.courseName} (${course.courseID})`);
    return course;
  }
  catch (error) {
    logger.error(`❌ Error fetching course data:`, error);
    throw new Error(`Failed to fetch course data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get all accepted friends of the current golfer
 */
export async function getAcceptedFriendsForInvitation(userId: string) {
  try {
    // Get all accepted friend relationships
    const friendships = await FriendModel.find({
      $or: [
        { requesterId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    });

    // Extract friend user IDs
    const friendUserIds = friendships.map(f =>
      f.requesterId.toString() === userId
        ? f.receiverId
        : f.requesterId,
    );

    // Get golfer profiles for these friends
    const friends = await GolferModel.find({
      userId: { $in: friendUserIds },
    }).populate({
      path: "userId",
      select: "email handicapIndex",
    });

    return friends;
  }
  catch (error) {
    console.error("Error fetching accepted friends:", error);
    throw error;
  }
}

/**
 * Validate that selected golfers are all accepted friends
 */
export async function validateFriendsSelection(
  creatorUserId: string,
  selectedGolferIds: string[],
) {
  const acceptedFriends = await getAcceptedFriendsForInvitation(creatorUserId);
  const acceptedFriendIds = acceptedFriends.map(f => f._id.toString());

  const invalidGolfers = selectedGolferIds.filter(
    id => !acceptedFriendIds.includes(id),
  );

  if (invalidGolfers.length > 0) {
    throw new Error(
      `Some selected golfers are not in your accepted friends list.`,
    );
  }

  return true;
}

/**
 * Create a friend event (golfer-created)
 */
export async function createFriendEvent(
  req: Request,
  res: Response,
) {
  try {
    const {
      courseID,
      eventDate,
      eventTime,
      gameFormat,
      eventName,
      selectedGolfers,
      description,
    } = req.body;

    const creatorUserId = req.user?.userId;
    if (!creatorUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const creatorGolfer = await GolferModel.findOne({ userId: creatorUserId });

    // ============================================
    // 1. AUTHORIZATION & VALIDATION
    // ============================================
    if (!creatorGolfer) {
      return res.status(404).json({ message: "Golfer profile not found" });
    }

    // Validate required fields
    if (
      !courseID
      || !eventDate
      || !eventTime
      || !gameFormat
      || !eventName
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: courseID, eventDate, eventTime, gameFormat, eventName",
      });
    }

    // Validate game format is stroke_play (as per requirements)
    if (gameFormat !== "stroke_play") {
      return res.status(400).json({
        message: "Friend events currently support stroke play format only",
      });
    }

    // Validate selected friends
    if (
      !selectedGolfers
      || !Array.isArray(selectedGolfers)
      || selectedGolfers.length < 1
    ) {
      return res.status(400).json({
        message: "Please select at least one friend to invite",
      });
    }

    // ============================================
    // 2. VERIFY EVENT DATE IS IN FUTURE
    // ============================================
    const eventDateTime = new Date(eventDate);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({
        message: "Event date must be in the future",
      });
    }

    // ============================================
    // 3. VERIFY ALL SELECTED GOLFERS ARE FRIENDS
    // ============================================
    try {
      await validateFriendsSelection(creatorUserId, selectedGolfers);
    }
    catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // ============================================
    // 4. FETCH COURSE DETAILS
    // ============================================
    let course;
    try {
      course = await getCourseData(courseID);
    }
    catch (courseError: any) {
      return res.status(404).json({
        message: courseError.message || "Course not found in API or database",
      });
    }

    // ============================================
    // 5. CREATE EVENT
    // ============================================
    const event = await EventModel.create({
      eventName,
      eventType: "friend", // ✅ Mark as friend event
      createdBy: creatorUserId,
      courseId: course._id, // ✅ Use MongoDB ObjectId
      eventDate: eventDateTime,
      eventTime,
      gameFormat,
      description: description || null,
      currentParticipants: 0,
      registrationDeadline: eventDateTime,
      status: "upcoming",
      isPublic: false, // ✅ Friend events are private
      leaderboard: [],
      brackets: [],
    });

    logger.info(`✅ Friend event created: ${eventName} (${event._id})`);

    // ============================================
    // 6. CREATE INVITATIONS FOR SELECTED FRIENDS
    // ============================================
    const invitations = selectedGolfers.map(golferId => ({
      eventId: event._id,
      golferId,
      invitedBy: creatorUserId,
      invitationStatus: "pending",
      invitedAt: new Date(),
      expiresAt: eventDateTime,
    }));

    const createdInvitations = await EventInvitationModel.insertMany(invitations);

    logger.info(`✅ Created ${createdInvitations.length} invitations for friend event`);

    // ============================================
    // 7. CREATE NOTIFICATIONS FOR INVITED FRIENDS
    // ============================================
    const selectedGolferProfiles = await GolferModel.find({
      _id: { $in: selectedGolfers },
    }).select("userId");

    const creatorProfile = await GolferModel.findById(creatorGolfer._id).select(
      "fullName",
    );

    const notifications = selectedGolferProfiles.map(golfer => ({
      recipientId: golfer.userId,
      type: "friend_event_invitation",
      title: "Friend Event Invitation",
      message: `${creatorProfile?.fullName} invited you to play "${eventName}" at ${course.courseName}`,
      relatedEntityType: "Event",
      relatedEntityId: event._id,
      isRead: false,
    }));

    await NotificationModel.insertMany(notifications);

    // ============================================
    // 8. POPULATE AND RETURN EVENT DATA
    // ============================================
    const populatedEvent = await EventModel.findById(event._id)
      .populate("createdBy", "fullName email role profileImage")
      .populate("courseId", "courseName clubName location courseID numHoles measure tees");

    const invitationsWithGolfers = await EventInvitationModel.find({
      eventId: event._id,
    })
      .populate({
        path: "golferId",
        select: "fullName profileImage userId gender",
        populate: {
          path: "userId",
          select: "handicapIndex email",
        },
      })
      .lean();

    return res.status(201).json({
      message: "Friend event created successfully",
      event: populatedEvent,
      course: {
        id: course._id,
        courseID: course.courseID, // ✅ Include API courseID
        courseName: course.courseName,
        clubName: course.clubName,
        city: course.location?.city,
        country: course.location?.country,
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
        golfer: inv.golferId
          ? {
              id: inv.golferId._id,
              fullName: inv.golferId.fullName,
              profileImage: inv.golferId.profileImage,
              gender: inv.golferId.gender,
              handicapIndex: inv.golferId.userId?.handicapIndex || null,
            }
          : null,
        status: inv.invitationStatus,
        invitedAt: inv.invitedAt,
        expiresAt: inv.expiresAt,
      })),
      stats: {
        totalInvited: createdInvitations.length,
        pendingResponses: createdInvitations.length,
      },
    });
  }
  catch (error) {
    console.error("Error creating friend event:", error);
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
      message: "Internal server error while creating friend event",
    });
  }
}

/**
 * GET GOLFER'S FRIEND EVENTS
 * GET /api/v1/friend-events/my-events
 */
export async function getGolferFriendEvents(
  req: Request,
  res: Response,
) {
  try {
    const creatorUserId = req.user!.userId;
    const creatorGolfer = await GolferModel.findOne({ userId: creatorUserId });

    if (!creatorGolfer) {
      return res.status(404).json({
        message: "Golfer profile not found",
      });
    }

    const events = await EventModel.find({
      eventType: "friend",
      createdBy: creatorUserId,
    })
      .populate("courseId", "courseName clubName location numHoles courseID")
      .populate("createdBy", "fullName email profileImage")
      .sort({ eventDate: -1 })
      .lean();

    const enrichedEvents = await Promise.all(
      events.map(async (event: any) => {
        const invitations = await EventInvitationModel.find({
          eventId: event._id,
        }).lean();

        return {
          ...event,
          invitationStats: {
            total: invitations.length,
            pending: invitations.filter(i => i.invitationStatus === "pending").length,
            accepted: invitations.filter(i => i.invitationStatus === "accepted").length,
            declined: invitations.filter(i => i.invitationStatus === "declined").length,
          },
        };
      }),
    );

    return res.status(200).json({
      events: enrichedEvents,
      count: enrichedEvents.length,
    });
  }
  catch (error: any) {
    logger.error("Error fetching friend events:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * GET FRIEND EVENTS GOLFER IS INVITED TO
 * GET /api/v1/friend-events/my-invitations
 */
export async function getFriendEventInvitations(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user!.userId;
    const golfer = await GolferModel.findOne({ userId });

    if (!golfer) {
      return res.status(404).json({
        message: "Golfer profile not found",
      });
    }

    const invitations = await EventInvitationModel.find({
      golferId: golfer._id,
    })
      .populate({
        path: "eventId",
        match: { eventType: "friend" },
        populate: [
          {
            path: "courseId",
            select: "courseName clubName location numHoles courseID",
          },
          {
            path: "createdBy",
            select: "fullName email profileImage",
          },
        ],
      })
      .populate({
        path: "golferId",
        select: "fullName profileImage gender",
        populate: {
          path: "userId",
          select: "handicapIndex email",
        },
      })
      .populate({
        path: "invitedBy",
        select: "fullName profileImage email",
      })
      .sort({ invitedAt: -1 })
      .lean();

    const friendEventInvitations = invitations.filter(inv => inv.eventId);

    const formattedInvitations = friendEventInvitations.map(inv => ({
      invitationId: inv._id,
      event: inv.eventId
        ? {
            id: inv.eventId._id,
            eventName: inv.eventId.eventName,
            eventDate: inv.eventId.eventDate,
            eventTime: inv.eventId.eventTime,
            gameFormat: inv.eventId.gameFormat,
            status: inv.eventId.status,
            createdBy: {
              fullName: inv.eventId.createdBy?.fullName,
              email: inv.eventId.createdBy?.email,
              profileImage: inv.eventId.createdBy?.profileImage,
            },
            course: {
              id: inv.eventId.courseId?._id,
              courseID: inv.eventId.courseId?.courseID, // ✅ Include API courseID
              courseName: inv.eventId.courseId?.courseName,
              clubName: inv.eventId.courseId?.clubName,
              numHoles: inv.eventId.courseId?.numHoles,
            },
          }
        : null,
      invitedBy: {
        fullName: inv.invitedBy?.fullName,
        email: inv.invitedBy?.email,
        profileImage: inv.invitedBy?.profileImage,
      },
      invitationStatus: inv.invitationStatus,
      invitedAt: inv.invitedAt,
      respondedAt: inv.respondedAt,
      expiresAt: inv.expiresAt,
    }));

    return res.status(200).json({
      invitations: formattedInvitations,
      count: formattedInvitations.length,
    });
  }
  catch (error: any) {
    logger.error("Error fetching friend event invitations:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * GET AVAILABLE FRIENDS LIST (for invitation selection)
 * GET /api/v1/friend-events/available-friends
 */
export async function getAvailableFriendsForEvent(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user!.userId;
    const acceptedFriends = await getAcceptedFriendsForInvitation(userId);

    const formattedFriends = acceptedFriends.map(friend => ({
      golferId: friend._id,
      fullName: friend.fullName,
      profileImage: friend.profileImage,
      gender: friend.gender,
      handicapIndex: friend.userId?.handicapIndex || null,
      email: friend.userId?.email,
    }));

    return res.status(200).json({
      friends: formattedFriends,
      count: formattedFriends.length,
    });
  }
  catch (error: any) {
    logger.error("Error fetching available friends:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}



