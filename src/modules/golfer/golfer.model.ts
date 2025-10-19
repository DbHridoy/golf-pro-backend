import { model, Schema } from "mongoose";

const GolferSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
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
}, {
  timestamps: true,
});

GolferSchema.index({ userId: 1 }, { unique: true });

const GolferModel = model("Golfer", GolferSchema);

export default GolferModel;
