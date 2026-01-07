// Hole Score Sub-schema
const HoleScoreSchema = new Schema({
  holeNumber: { type: Number, required: true, min: 1, max: 18 },
  par: { type: Number, required: true, min: 3, max: 6 },
  strokes: { type: Number, required: true, min: 1 },
  putts: { type: Number, required: true, min: 0 },
  chipShots: { type: Number, default: 0 },
  sandShots: { type: Number, default: 0 },
  penalties: { type: Number, default: 0 },
  fairwayHit: { type: Boolean, default: false },
  greenInRegulation: {
    type: String,
    enum: ["hit", "miss_long", "miss_short", "miss_right", "miss_left", "no_chance"],
    required: true,
  },
  bunkers: [{ type: String, enum: ["fairway", "greenside"] }],
  penaltyTypes: [{ type: String, enum: ["water", "ob", "drop"] }],
});

// Scorecard Schema
const ScorecardSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: "GolferProfile", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  gameDate: { type: Date, required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true },
  teeBox: { type: String, required: true },
  grossScore: { type: Number, required: true },
  netScore: { type: Number, required: true },
  holes: [HoleScoreSchema],
  totalPutts: { type: Number, required: true },
  penalties: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  isAttestedBy: { type: Schema.Types.ObjectId, ref: "GolferProfile" },
}, { timestamps: true });
