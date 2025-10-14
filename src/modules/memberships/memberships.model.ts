import { model, Schema } from "mongoose";

const MembershipSchema = new Schema(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    golferId: {
      type: Schema.Types.ObjectId,
      ref: "GolferProfile",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Ensure one membership per user-club pair
MembershipSchema.index({ clubId: 1, golferId: 1 },{ unique: true });

const MembershipModel = model("Membership", MembershipSchema);
export default MembershipModel;
