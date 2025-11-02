// file: src/modules/handicaps/handicap-history.model.ts
import { model, Schema } from "mongoose";

const HandicapHistorySchema = new Schema({
  golferId: { type: Schema.Types.ObjectId, ref: "Golfer", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // Round reference
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  gameParticipationId: { type: Schema.Types.ObjectId, ref: "GameParticipation" },
  scorecardId: { type: Schema.Types.ObjectId, ref: "Scorecard", required: true },

  // Course information
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true },
  par: { type: Number, required: true, default: 72 },

  // Scores
  adjustedGrossScore: { type: Number, required: true }, // After ESC

  // USGA Handicap Calculation
  scoreDifferential: { type: Number, required: true },
  // Formula: (Adjusted Gross Score - Course Rating) × (113 / Slope Rating)

  // Handicap Index tracking
  handicapIndexBefore: { type: Number },
  handicapIndexAfter: { type: Number },

  // Calculation metadata
  calculatedAt: { type: Date, default: Date.now },
  roundDate: { type: Date, required: true },

  // Was this score used in handicap calculation?
  usedInCalculation: { type: Boolean, default: false },

  // Is this an exceptional score? (for peer review)
  isExceptional: { type: Boolean, default: false },

}, { timestamps: true });

// Indexes
HandicapHistorySchema.index({ golferId: 1, roundDate: -1 });
HandicapHistorySchema.index({ userId: 1, usedInCalculation: 1 });
HandicapHistorySchema.index({ golferId: 1, usedInCalculation: 1, scoreDifferential: 1 });

const HandicapHistoryModel = model("HandicapHistory", HandicapHistorySchema);
export default HandicapHistoryModel;
