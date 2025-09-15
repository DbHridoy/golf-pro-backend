// Player Statistics Schema
const PlayerStatisticsSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: "GolferProfile", required: true },
  year: { type: Number, required: true },
  month: { type: Number, min: 1, max: 12 },

  // Round statistics
  totalRounds: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  bestScore: { type: Number },
  worstScore: { type: Number },

  // Score distribution
  scores60s: { type: Number, default: 0 },
  scores70s: { type: Number, default: 0 },
  scores80s: { type: Number, default: 0 },
  scores90s: { type: Number, default: 0 },

  // Performance metrics
  averagePutts: { type: Number, default: 0 },
  bestPutts: { type: Number },
  worstPutts: { type: Number },
  girPercentage: { type: Number, default: 0 },
  firPercentage: { type: Number, default: 0 },
  avgPenalties: { type: Number, default: 0 },

  // Achievements
  holesInOne: { type: Number, default: 0 },
  albatrosses: { type: Number, default: 0 },
  eagles: { type: Number, default: 0 },
  birdies: { type: Number, default: 0 },

  // Social statistics
  friendsCount: { type: Number, default: 0 },
  coursesPlayed: { type: Number, default: 0 },
  averageRoundsPerMonth: { type: Number, default: 0 },
}, { timestamps: true });
