import { model, Schema } from "mongoose";

const MatchSchema = new Schema({
  player1: { type: Schema.Types.ObjectId, ref: "Golfer", required: true },
  player2: { type: Schema.Types.ObjectId, ref: "Golfer", required: true },
  winner: { type: Schema.Types.ObjectId, ref: "Golfer" },
  score: { type: String },
});

const BracketSchema = new Schema({
  roundNumber: { type: Number, required: true },
  matches: [MatchSchema],
});

const EventSchema = new Schema({
  eventName: { type: String, required: true, trim: true, maxlength: 200 },
  clubId: { type: Schema.Types.ObjectId, ref: "Club" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  gameFormat: {
    type: String,
    required: true,
    // enum: [
    //   "stroke_play",
    //   "match_play",
    //   "stableford",
    //   "four_ball",
    //   "foursomes",
    //   "par_bogey",
    //   "scramble",
    //   "nassau",
    //   "wolf",
    //   "skins",
    //   "vegas",
    //   "hammer",
    //   "bingo_bango_bongo",
    // ],
  },

  currentParticipants: { type: Number, default: 0 }, // ✅ ADD THIS - Track accepted invitations
  status: {
    type: String,
    enum: ["draft", "upcoming", "active", "completed", "cancelled"],
    default: "draft",
  },
  isPublic: { type: Boolean, default: true },
  description: { type: String, max_length: 1000 },
  prizePool: { type: Number, min: 0 },
  registrationDeadline: { type: Date },
  leaderboard: [{ type: Schema.Types.ObjectId, ref: "GameParticipation" }],
  brackets: [BracketSchema],
}, { timestamps: true });

// Indexes
EventSchema.index({ clubId: 1, status: 1 });
EventSchema.index({ eventDate: 1, status: 1 });
EventSchema.index({ createdBy: 1 });

const EventModel = model("Event", EventSchema);

export default EventModel;
