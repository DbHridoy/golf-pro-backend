import { Document, model, Schema } from "mongoose";

import type { IHandicapHistory, IScoreDifferential } from "./handicap.interface";

// Define the ScoreDifferential schema
const scoreDifferentialSchema = new Schema<IScoreDifferential>({
  adjustedGrossScore: { type: Number, required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true },
  pccAdjustment: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  differential: { type: Number, required: true },
  isUsedInCalculation: { type: Boolean, default: true },
}, { _id: false });

// Define the HandicapHistory schema
const handicapHistorySchema = new Schema<IHandicapHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  scores: [scoreDifferentialSchema],
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
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
  },
});

// Indexes for better query performance
handicapHistorySchema.index({ userId: 1 });
handicapHistorySchema.index({ lastUpdated: -1 });

// Create and export the model
const HandicapHistory = model<IHandicapHistory>("HandicapHistory", handicapHistorySchema);

export default HandicapHistory;
