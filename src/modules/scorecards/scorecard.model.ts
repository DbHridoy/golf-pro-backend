// file: src/modules/scorecards/scorecard.model.ts (UPDATE)
import { model, Schema } from "mongoose";

const HoleScoreSchema = new Schema({
  holeNumber: { type: Number, required: true, min: 1, max: 18 },
  par: { type: Number, required: true },
  strokeIndex: { type: Number }, // From course data (indexesMen/indexesWomen)
  length: { type: Number }, // From selected tee box
  strokes: { type: Number, min: 0, default: 0 },
  putts: { type: Number, min: 0, default: 0 },

  // Shot tracking
  fairwayHit: { type: Boolean, default: null }, // null for par 3s
  greenInRegulation: { type: Boolean, default: false },

  // Penalties and special situations
  penalties: { type: Number, min: 0, default: 0 },
  sandSaves: { type: Number, min: 0, default: 0 },
  chipIns: { type: Number, min: 0, default: 0 },

  // Achievements
  isEagle: { type: Boolean, default: false },
  isBirdie: { type: Boolean, default: false },
  isPar: { type: Boolean, default: false },
  isBogey: { type: Boolean, default: false },
  isDoubleBogeyOrWorse: { type: Boolean, default: false },
  isHoleInOne: { type: Boolean, default: false },
  isAlbatross: { type: Boolean, default: false },

  // For handicap calculation (ESC - Equitable Stroke Control)
  adjustedStrokes: { type: Number },

  // Timestamps for each hole completion
  completedAt: { type: Date },

}, { _id: false });

const ScorecardSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  gameParticipationId: { type: Schema.Types.ObjectId, ref: "GameParticipation", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "Golfer", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

  // Tee selection
  selectedTeeID: { type: String, required: true }, // "210722", "210723", "210724"
  selectedTeeName: { type: String, required: true }, // "Gelb", "Blau", "Rot"
  selectedTeeColor: { type: String }, // Hex color

  // Gender-specific ratings
  gender: { type: String, enum: ["male", "female"], required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true },

  // Hole-by-hole scores
  holes: [HoleScoreSchema],

  // Summary scores
  front9Score: { type: Number, default: 0 },
  back9Score: { type: Number, default: 0 },
  totalGrossScore: { type: Number, default: 0 },
  totalNetScore: { type: Number, default: 0 },
  adjustedGrossScore: { type: Number },

  // Handicap information
  handicapUsed: { type: Number },
  playingHandicap: { type: Number }, // Course Handicap = Handicap Index × (Slope Rating / 113)

  // Statistics
  totalPutts: { type: Number, default: 0 },
  totalPenalties: { type: Number, default: 0 },
  fairwaysHit: { type: Number, default: 0 },
  fairwaysTotal: { type: Number, default: 14 },
  greensInRegulation: { type: Number, default: 0 },
  sandSaves: { type: Number, default: 0 },

  // Achievements
  eagles: { type: Number, default: 0 },
  birdies: { type: Number, default: 0 },
  pars: { type: Number, default: 0 },
  bogeys: { type: Number, default: 0 },
  doubleBogeys: { type: Number, default: 0 },
  holesInOne: { type: Number, default: 0 },
  albatrosses: { type: Number, default: 0 },

  // Round status
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed", "abandoned", "invalidated"],
    default: "not_started",
  },

  // Timestamps
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastHoleCompletedAt: { type: Date },

  // Online status tracking
  lastOnlineAt: { type: Date, default: Date.now },
  isPlayerOnline: { type: Boolean, default: true },

}, { timestamps: true });

// Indexes
ScorecardSchema.index({ eventId: 1, playerId: 1 }, { unique: true });
ScorecardSchema.index({ gameParticipationId: 1 });
ScorecardSchema.index({ playerId: 1, status: 1 });
ScorecardSchema.index({ eventId: 1, status: 1 });

const ScorecardModel = model("Scorecard", ScorecardSchema);
export default ScorecardModel;

