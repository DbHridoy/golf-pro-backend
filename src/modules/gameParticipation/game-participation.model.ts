import { model, Schema } from "mongoose";

const GameParticipationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "Golfer", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  scorecardId: { type: Schema.Types.ObjectId, ref: "Scorecard" },

  // Final scores
  finalScore: { type: Number },
  netScore: { type: Number },
  position: { type: Number },
  handicapUsed: { type: Number },

  // Statistics
  totalPutts: { type: Number, default: 0 },
  girPercentage: { type: Number, default: 0 },
  firPercentage: { type: Number, default: 0 },
  penalties: { type: Number, default: 0 },

  // Achievements
  birdies: { type: Number, default: 0 },
  eagles: { type: Number, default: 0 },
  albatrosses: { type: Number, default: 0 },
  holesInOne: { type: Number, default: 0 },

  // Participation status
  status: {
    type: String,
    enum: ["registered", "playing", "completed", "disqualified"],
    default: "registered",
  },

  playedAt: { type: Date },
}, { timestamps: true });

// Indexes for performance
GameParticipationSchema.index({ eventId: 1, playerId: 1 }, { unique: true });
GameParticipationSchema.index({ eventId: 1, status: 1 });
GameParticipationSchema.index({ playerId: 1, status: 1 });

const GameParticipationModel = model("GameParticipation", GameParticipationSchema);

export default GameParticipationModel;
