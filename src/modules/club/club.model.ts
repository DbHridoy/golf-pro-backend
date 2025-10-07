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
  clubMembers: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "GolferProfile",
      },
    ],
    default: [],
  },
  clubMembershipRequests: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "GolferProfile",
      },
    ],
    default: [],
  },
  notifications: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    default: null,
  },
});

const ClubProfileModel = model("Club", ClubProfileSchema);
export default ClubProfileModel;
