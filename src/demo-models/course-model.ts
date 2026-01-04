// Hole Sub-schema
const HoleSchema = new Schema({
  holeNumber: { type: Number, required: true, min: 1, max: 18 },
  par: { type: Number, required: true, min: 3, max: 6 },
  yards: { type: Number, required: true },
  handicapRating: { type: Number, required: true, min: 1, max: 18 },
  teeLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  flagLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
});

// TeeBox Sub-schema
const TeeBoxSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true, min: 55, max: 155 },
  totalYards: { type: Number, required: true },
});

// Course Schema
const CourseSchema = new Schema({
  courseName: { type: String, required: true },
  clubId: { type: Schema.Types.ObjectId, ref: "GolfClubProfile" },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  courseType: { type: String, enum: ["public", "private", "semi-private"], required: true },
  totalHoles: { type: Number, enum: [9, 18], required: true },
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true, min: 55, max: 155 },
  par: { type: Number, required: true },
  totalYards: { type: Number, required: true },
  courseImage: { type: String },
  holes: [HoleSchema],
  teeBoxes: [TeeBoxSchema],
}, { timestamps: true });
