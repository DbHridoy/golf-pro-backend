import { model, Schema } from "mongoose";

const TeeBoxSchema = new Schema({
  teeID: { type: String, required: true },
  teeName: { type: String, required: true }, // "Gelb", "Blau", "Rot"
  teeColor: { type: String }, // Hex color code like "#FFFF00"

  // Lengths for all 18 holes
  holeLengths: [{ type: Number }], // Array of 18 lengths

  // Men's ratings
  courseRatingMen: { type: Number },
  slopeMen: { type: Number },
  courseRatingMenFront9: { type: Number },
  courseRatingMenBack9: { type: Number },
  slopeMenFront9: { type: Number },
  slopeMenBack9: { type: Number },

  // Women's ratings
  courseRatingWomen: { type: Number },
  slopeWomen: { type: Number },
  courseRatingWomenFront9: { type: Number },
  courseRatingWomenBack9: { type: Number },
  slopeWomenFront9: { type: Number },
  slopeWomenBack9: { type: Number },

  // Total length
  totalLength: { type: Number },

}, { _id: false });

const CourseSchema = new Schema({
  // External API reference
  courseID: { type: String, required: true, unique: true }, // "0121304168600767"
  clubID: { type: String }, // "1304167809371"

  // Basic course information
  clubName: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },

  // Location data
  location: {
    address: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    latitude: { type: String },
    longitude: { type: String },
  },

  // Contact information
  website: { type: String, trim: true },
  telephone: { type: String, trim: true },

  // Course details
  numHoles: { type: Number, default: 18 },
  measure: { type: String, enum: ["m", "yards"], default: "m" }, // meters or yards
  hasGPS: { type: Boolean, default: false },

  // Par and indexes for men and women
  parsMen: [{ type: Number }], // Array of 18 pars
  indexesMen: [{ type: Number }], // Array of 18 stroke indexes
  parsWomen: [{ type: Number }], // Array of 18 pars
  indexesWomen: [{ type: Number }], // Array of 18 stroke indexes

  // Tee boxes
  numTees: { type: Number, default: 0 },
  tees: [TeeBoxSchema],

  // Sync tracking
  timestampUpdated: { type: String }, // From API
  lastSyncedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

  // Metadata
  totalTimesPlayed: { type: Number, default: 0 },
  averageScore: { type: Number },

  // Old course IDs (for migration tracking)
  oldCourseIDs: [{ type: String }],

}, { timestamps: true });

// Indexes for performance
CourseSchema.index({ courseID: 1 });
CourseSchema.index({ clubID: 1 });
CourseSchema.index({ "location.city": 1, "location.country": 1 });
CourseSchema.index({ courseName: "text", clubName: "text" });

const CourseModel = model("Course", CourseSchema);
export default CourseModel;
