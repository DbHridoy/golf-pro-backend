import { model, Schema } from "mongoose";

import type { IHandicapHistory, IScoreDifferential } from "./handicap.type";

const ScoreDifferentialSchema = new Schema<IScoreDifferential>({
  adjustedGrossScore: { type: Number, required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true },
  pccAdjustment: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  differential: { type: Number, required: true },
  isUsedInCalculation: { type: Boolean, default: false },
}, { _id: false });

const HandicapHistorySchema = new Schema<IHandicapHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  scores: [ScoreDifferentialSchema],
  currentHandicapIndex: {
    type: Number,
    default: 54.0,
    min: 0,
    max: 54.0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for faster lookups
HandicapHistorySchema.index({ userId: 1 });
HandicapHistorySchema.index({ lastUpdated: -1 });

export const HandicapHistory = model<IHandicapHistory>("HandicapHistory", HandicapHistorySchema);
