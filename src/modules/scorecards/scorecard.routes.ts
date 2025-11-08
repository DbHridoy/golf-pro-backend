import express from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { getLiveLeaderboard, updateHoleScore } from "./scorecard.service";

const router = express.Router();

router.use(authMiddleware.authenticate);

// Scoring
router.patch("/scorecards/:scorecardId/holes", authMiddleware.authorize(["golfer"]), updateHoleScore);

// Leaderboard
router.get("/events/:eventId/leaderboard", authMiddleware.authorize(["golfer"]), getLiveLeaderboard);

export default router;
