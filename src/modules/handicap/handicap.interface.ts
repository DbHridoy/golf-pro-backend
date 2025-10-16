import type { Document } from "mongoose";

import type { IUser } from "../user/user.interface";

export interface IScoreDifferential {
  adjustedGrossScore: number;
  courseRating: number;
  slopeRating: number;
  pccAdjustment: number;
  date: Date;
  differential: number;
  isUsedInCalculation: boolean;
}

export interface IHandicapHistory extends Document {
  userId: IUser["_id"];
  scores: IScoreDifferential[];
  currentHandicapIndex: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHandicapCalculationResult {
  handicapIndex: number;
  courseHandicap: number;
  playingHandicap: number;
  scoresUsed: number;
  totalScores: number;
}

export interface IHandicapService {
  processScore: (params: ICalculateHandicapParams) => Promise<IHandicapCalculationResult>;
  getHandicap: (userId: string) => Promise<{
    handicapIndex: number;
    lastUpdated: Date;
    scoresCount: number;
  } | null>;
  getHandicapHistory: (userId: string) => Promise<{
    currentHandicapIndex: number;
    lastUpdated: Date;
    scores: Array<{
      date: Date;
      adjustedGrossScore: number;
      courseRating: number;
      slopeRating: number;
      differential: number;
      isUsedInCalculation: boolean;
    }>;
  }>;
}

export interface IHandicapController {
  submitScore: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getMyHandicap: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getHandicapHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface IHandicapRepository {
  getHandicapHistory: (userId: string) => Promise<IHandicapHistory | null>;
  addScore: (
    userId: string,
    score: Omit<IScoreDifferential, "isUsedInCalculation">,
    handicapIndex: number
  ) => Promise<IHandicapHistory>;
  getBestDifferentials: (userId: string, count: number) => Promise<IScoreDifferential[]>;
  updateHandicapIndex: (userId: string, handicapIndex: number) => Promise<void>;
}
