import { Types } from "mongoose";

import type { IHandicapHistory, IScoreDifferential } from "./handicap.type";

import { HandicapHistory } from "./handicap.schema";
import { IHandicapCalculationResult } from "./handicap.type";

export class HandicapRepository {
  /**
   * Get a user's handicap history
   */
  async getHandicapHistory(userId: string): Promise<IHandicapHistory | null> {
    return HandicapHistory.findOne({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Add a new score to the user's handicap history
   */
  async addScore(
    userId: string,
    score: Omit<IScoreDifferential, "isUsedInCalculation">,
    handicapIndex: number,
  ): Promise<IHandicapHistory> {
    const scoreWithCalculation = {
      ...score,
      isUsedInCalculation: true,
    };

    return HandicapHistory.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $push: {
          scores: {
            $each: [scoreWithCalculation],
            $sort: { date: -1 },
            $slice: -20, // Keep only the last 20 scores
          },
        },
        $set: {
          currentHandicapIndex: handicapIndex,
          lastUpdated: new Date(),
        },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  /**
   * Get the best differentials for handicap calculation
   */
  async getBestDifferentials(userId: string, count: number): Promise<IScoreDifferential[]> {
    const history = await HandicapHistory.findOne(
      { userId: new Types.ObjectId(userId) },
      { scores: 1 },
    ).sort({ "scores.date": -1 }).limit(20); // Get up to 20 most recent scores

    if (!history || !history.scores || history.scores.length === 0) {
      return [];
    }

    // Sort by differential (ascending - lower is better)
    const sortedScores = [...history.scores].sort((a, b) => a.differential - b.differential);

    // Return the best (lowest) differentials, up to the requested count
    return sortedScores.slice(0, Math.min(count, sortedScores.length));
  }

  /**
   * Update the user's handicap index
   */
  async updateHandicapIndex(userId: string, handicapIndex: number): Promise<void> {
    await HandicapHistory.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          currentHandicapIndex: handicapIndex,
          lastUpdated: new Date(),
        },
      },
      { upsert: true },
    );
  }
}

export const handicapRepository = new HandicapRepository();
