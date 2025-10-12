import { model, Schema } from "mongoose";

const MembershipSchema = new Schema(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "GolferProfile",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["member", "admin", "coach"],
      default: "member",
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
  { timestamps: true }
);

// Ensure one membership per user-club pair
MembershipSchema.index({ clubId: 1, userId: 1 }, { unique: true });

const MembershipModel = model("Membership", MembershipSchema);
export default MembershipModel;
