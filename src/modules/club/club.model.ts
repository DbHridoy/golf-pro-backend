import { model, Schema } from "mongoose";

const ClubSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  country: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  clubProfileImage: {
    type: String,
    default: null,
  },
  clubCoverImage: {
    type: String,
    default: null,
  },
  ghinNumber: {
    type: String,
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
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc: Record<string, any>, ret: Record<string, any>) {
      delete ret.__v;
      return ret;
    },
  },
});

ClubSchema.index({ userId: 1 }, { unique: true });

const ClubModel = model("Club", ClubSchema);

export default ClubModel;
