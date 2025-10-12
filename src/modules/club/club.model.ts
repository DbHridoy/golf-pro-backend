import { model, Schema } from "mongoose";

const ClubSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    clubName: { type: String, default: null },
    country: { type: String, default: null },
    city: { type: String, default: null },
    address: { type: String, default: null },
    clubProfileImage: { type: String, default: null },
    clubCoverImage: { type: String, default: null },
    ghinNumber: { type: String, default: null },
    isProfilePublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Virtual: populate members if needed
ClubSchema.virtual("memberships", {
  ref: "Membership",
  localField: "_id",
  foreignField: "clubId",
});

const ClubModel = model("Club", ClubSchema);
export default ClubModel;
