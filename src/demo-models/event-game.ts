// Match Sub-schema for brackets
const MatchSchema = new Schema({
  player1: { type: Schema.Types.ObjectId, ref: "GolferProfile", required: true },
  player2: { type: Schema.Types.ObjectId, ref: "GolferProfile", required: true },
  winner: { type: Schema.Types.ObjectId, ref: "GolferProfile" },
  score: { type: String },
});

// Bracket Sub-schema
const BracketSchema = new Schema({
  roundNumber: { type: Number, required: true },
  matches: [MatchSchema],
});

// Event Schema
const EventSchema = new Schema({
  eventName: { type: String, required: true },
  clubId: { type: Schema.Types.ObjectId, ref: "GolfClubProfile" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  gameFormat: {
    type: String,
    required: true,
    enum: [
      "stroke_play",
      "match_play",
      "stableford",
      "four_ball",
      "foursomes",
      "par_bogey",
      "scramble",
      "nassau",
      "wolf",
      "skins",
      "vegas",
      "hammer",
      "bingo_bango_bongo",
    ],
  },
  maxParticipants: { type: Number, required: true, min: 2 },
  currentParticipants: { type: Number, default: 0 },
  participants: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
  status: { type: String, enum: ["upcoming", "active", "completed", "cancelled"], default: "upcoming" },
  isPublic: { type: Boolean, default: true },
  description: { type: String },
  prizePool: { type: Number },
  registrationDeadline: { type: Date },
  leaderboard: [{ type: Schema.Types.ObjectId, ref: "GameParticipation" }],
  brackets: [BracketSchema],
}, { timestamps: true });

// Game Participation Schema
const GameParticipationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "GolferProfile", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  scorecardId: { type: Schema.Types.ObjectId, ref: "Scorecard" },
  finalScore: { type: Number },
  netScore: { type: Number },
  position: { type: Number },
  handicapUsed: { type: Number },
  totalPutts: { type: Number },
  girPercentage: { type: Number },
  firPercentage: { type: Number },
  penalties: { type: Number, default: 0 },
  birdies: { type: Number, default: 0 },
  eagles: { type: Number, default: 0 },
  albatrosses: { type: Number, default: 0 },
  holesInOne: { type: Number, default: 0 },
  status: { type: String, enum: ["registered", "playing", "completed", "disqualified"], default: "registered" },
  playedAt: { type: Date },
}, { timestamps: true });
