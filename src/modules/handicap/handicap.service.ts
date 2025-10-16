import { Types } from "mongoose";

import type {
  ICalculateHandicapParams,
  IHandicapCalculationResult,
  IHandicapOptions,
} from "./handicap.type";

import { handicapRepository } from "./handicap.repository";
import {
  DEFAULT_HANDICAP_OPTIONS,
  IScoreDifferential,
} from "./handicap.type";

export class HandicapService {
  /**
   * Calculate a score differential based on the World Handicap System formula
   * Formula: (113 / Slope Rating) × (Adjusted Gross Score - Course Rating - PCC adjustment)
   */
  private calculateScoreDifferential(
    adjustedGrossScore: number,
    courseRating: number,
    slopeRating: number,
    pccAdjustment: number = 0,
  ): number {
    const differential = (113 / slopeRating) * (adjustedGrossScore - courseRating - pccAdjustment);
    return this.roundToOneDecimal(differential);
  }

  /**
   * Calculate a player's handicap index based on their best differentials
   */
  private calculateHandicapIndex(differentials: number[], options: IHandicapOptions): number {
    const { scoresToUse = 8, minScoresForIndex = 3, maxHandicapIndex = 54.0 } = options;

    if (differentials.length < minScoresForIndex) {
      return maxHandicapIndex; // Return maximum handicap if not enough scores
    }

    // Determine how many differentials to use based on number of scores available
    let differentialsToUse: number;
    if (differentials.length < 5) {
      differentialsToUse = 1;
    }
    else if (differentials.length < 7) {
      differentialsToUse = Math.min(2, differentials.length);
    }
    else if (differentials.length < 9) {
      differentialsToUse = Math.min(3, differentials.length);
    }
    else if (differentials.length < 11) {
      differentialsToUse = Math.min(4, differentials.length);
    }
    else if (differentials.length < 13) {
      differentialsToUse = Math.min(5, differentials.length);
    }
    else if (differentials.length < 15) {
      differentialsToUse = Math.min(6, differentials.length);
    }
    else if (differentials.length < 17) {
      differentialsToUse = Math.min(7, differentials.length);
    }
    else {
      differentialsToUse = Math.min(scoresToUse, differentials.length);
    }

    // Get the best (lowest) differentials
    const bestDifferentials = [...differentials]
      .sort((a, b) => a - b)
      .slice(0, differentialsToUse);

    // Calculate average and apply 96% multiplier
    const average = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;
    const handicapIndex = this.roundToOneDecimal(average * 0.96);

    // Ensure handicap doesn't exceed maximum
    return Math.min(handicapIndex, maxHandicapIndex);
  }

  /**
   * Calculate a player's course handicap
   * Formula: Handicap Index × (Slope Rating / 113) + (Course Rating - Par)
   */
  private calculateCourseHandicap(
    handicapIndex: number,
    slopeRating: number,
    courseRating: number,
    par: number,
  ): number {
    const courseHandicap = handicapIndex * (slopeRating / 113) + (courseRating - par);
    return Math.round(courseHandicap);
  }

  /**
   * Process a new score and update the player's handicap
   */
  async processScore(params: ICalculateHandicapParams): Promise<IHandicapCalculationResult> {
    const {
      userId,
      adjustedGrossScore,
      courseRating,
      slopeRating,
      par,
      pccAdjustment = 0,
      options = {},
    } = params;

    // Merge default options with provided options
    const calculationOptions: IHandicapOptions = { ...DEFAULT_HANDICAP_OPTIONS, ...options };

    // Calculate the score differential for this round
    const differential = this.calculateScoreDifferential(
      adjustedGrossScore,
      courseRating,
      slopeRating,
      pccAdjustment,
    );

    // Get the user's current handicap history
    const history = await handicapRepository.getHandicapHistory(userId);
    const currentScores = history?.scores || [];
    const currentDifferentials = currentScores.map(score => score.differential);

    // Add the new differential and calculate new handicap index
    const newDifferentials = [...currentDifferentials, differential];
    const newHandicapIndex = this.calculateHandicapIndex(newDifferentials, calculationOptions);

    // Calculate course handicap
    const courseHandicap = this.calculateCourseHandicap(
      newHandicapIndex,
      slopeRating,
      courseRating,
      par,
    );

    // Save the new score and update the handicap index
    await handicapRepository.addScore(
      userId,
      {
        adjustedGrossScore,
        courseRating,
        slopeRating,
        pccAdjustment,
        date: new Date(),
        differential,
      },
      newHandicapIndex,
    );

    return {
      handicapIndex: newHandicapIndex,
      courseHandicap,
      playingHandicap: courseHandicap, // Can be adjusted for competition play if needed
      scoresUsed: Math.min(newDifferentials.length, calculationOptions.scoresToUse || 8),
      totalScores: newDifferentials.length,
    };
  }

  /**
   * Get a user's current handicap information
   */
  async getHandicap(userId: string): Promise<{
    handicapIndex: number;
    lastUpdated: Date;
    scoresCount: number;
  } | null> {
    const history = await handicapRepository.getHandicapHistory(userId);
    if (!history)
      return null;

    return {
      handicapIndex: history.currentHandicapIndex,
      lastUpdated: history.lastUpdated,
      scoresCount: history.scores?.length || 0,
    };
  }

  /**
   * Get a user's complete handicap history
   */
  async getHandicapHistory(userId: string) {
    const history = await handicapRepository.getHandicapHistory(userId);
    if (!history) {
      return { scores: [] };
    }

    // Sort scores by date (newest first) and format the response
    const sortedScores = [...(history.scores || [])]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(score => ({
        date: score.date,
        adjustedGrossScore: score.adjustedGrossScore,
        courseRating: score.courseRating,
        slopeRating: score.slopeRating,
        differential: score.differential,
        isUsedInCalculation: score.isUsedInCalculation,
      }));

    return {
      currentHandicapIndex: history.currentHandicapIndex,
      lastUpdated: history.lastUpdated,
      scores: sortedScores,
    };
  }

  /**
   * Helper function to round to one decimal place
   */
  private roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
  }
}

export const handicapService = new HandicapService();
