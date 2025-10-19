import { model, Schema } from "mongoose";

const MembershipSchema = new Schema(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    golferId: {
      type: Schema.Types.ObjectId,
      ref: "Golfer",
      required: true,
    },
    requestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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

MembershipSchema.index({ clubId: 1, golferId: 1 }, { unique: true });

const MembershipModel = model("Membership", MembershipSchema);

export default MembershipModel;
