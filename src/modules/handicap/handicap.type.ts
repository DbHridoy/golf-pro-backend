import type { Document } from "mongoose";

export interface IScoreDifferential {
  adjustedGrossScore: number;
  courseRating: number;
  slopeRating: number;
  pccAdjustment?: number; // Playing Conditions Calculation adjustment (usually -1 to 3)
  date: Date;
  differential: number;
  isUsedInCalculation: boolean;
}

export interface IHandicapHistory extends Document {
  userId: string;
  scores: IScoreDifferential[];
  currentHandicapIndex: number;
  lastUpdated: Date;
}

export interface IHandicapCalculationResult {
  handicapIndex: number;
  courseHandicap: number;
  playingHandicap: number;
  scoresUsed: number;
  totalScores: number;
}

export interface ICourseInfo {
  courseRating: number;
  slopeRating: number;
  par: number;
}

export interface IHandicapOptions {
  maxHandicapIndex?: number; // Default 54.0
  minScoresForIndex?: number; // Default 3 (54 holes)
  scoresToUse?: number; // Default 8 (best of last 20)
  maxScoresStored?: number; // Default 20
  pccAdjustment?: number; // Default 0
}

export interface ICalculateHandicapParams {
  userId: string;
  adjustedGrossScore: number;
  courseRating: number;
  slopeRating: number;
  par: number;
  pccAdjustment?: number;
  options?: Partial<IHandicapOptions>;
}

export const DEFAULT_HANDICAP_OPTIONS: IHandicapOptions = {
  maxHandicapIndex: 54.0,
  minScoresForIndex: 3, // 3 rounds (54 holes) minimum
  scoresToUse: 8, // Best 8 of last 20
  maxScoresStored: 20,
  pccAdjustment: 0,
};
