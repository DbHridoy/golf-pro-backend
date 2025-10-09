import { model, Schema } from "mongoose";

const ClubProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  clubName: {
    type: String,
    default: null,
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
  isOnline:{
    type: Boolean,
    default: false
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
});

const ClubProfileModel = model("Club", ClubProfileSchema);
export default ClubProfileModel;
