import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { handicapController } from "./handicap.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware.authenticate);

/**
 * @route   POST /api/handicap/scores
 * @desc    Submit a new score and update handicap
 * @access  Private (Golfer, Golf Club, Admin)
 */
router.post(
  "/scores",
  authMiddleware.authorize(["golfer", "golf_club", "admin"]),
  handicapController.submitScore,
);

/**
 * @route   GET /api/handicap/me
 * @desc    Get current user's handicap information
 * @access  Private (Golfer, Golf Club, Admin)
 */
router.get(
  "/me",
  authMiddleware.authorize(["golfer", "golf_club", "admin"]),
  handicapController.getMyHandicap,
);

/**
 * @route   GET /api/handicap/history
 * @desc    Get user's handicap history
 * @access  Private (Golfer, Golf Club, Admin)
 */
router.get(
  "/history",
  authMiddleware.authorize(["golfer", "golf_club", "admin"]),
  handicapController.getHandicapHistory,
);

export default router;
