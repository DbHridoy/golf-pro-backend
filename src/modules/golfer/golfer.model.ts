
import { model, Schema } from "mongoose";

const LocationSchema = new Schema ({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
  },
}, { _id: false });

const GolferSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  clubId: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Golf_club",
  }],
  fullName: {
    type: String,
    trim: true,
    default: null,
    maxlength: 100,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer_not_to_say"],
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  country: {
    type: String,
    default: null,
    trim: true,
    maxlength: 100,
  },
  city: {
    type: String,
    default: null,
    trim: true,
    maxlength: 100,
  },
  address: {
    type: String,
    default: null,
    trim: true,
    maxlength: 200,
  },
  profileImage: {
    type: String,
    trim: true,
    default: null,
  },
  coverImage: {
    type: String,
    trim: true,
    default: null,
  },
  ghinNumber: {
    type: String,
    trim: true,
    default: null,
  },
  isProfilePublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  // ===== NEW: LOCATION TRACKING FIELDS =====
  currentLocation: {
    type: LocationSchema,
    default: null,
  },
  locationUpdatedAt: {
    type: Date,
    default: null,
  },
  isLocationSharingEnabled: {
    type: Boolean,
    default: true, // Default: enabled
  },
  currentEventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    default: null, // Set when golfer is actively playing an event
  },
  currentHole: {
    type: Number,
    min: 1,
    max: 18,
    default: null, // Which hole they're currently on
  },
}, {
  timestamps: true,
});

GolferSchema.index({ userId: 1 }, { unique: true });
GolferSchema.index({ currentLocation: "2dsphere" });

const GolferModel = model("Golfer", GolferSchema);

export default GolferModel;
