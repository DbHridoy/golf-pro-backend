import { model, Schema } from "mongoose";

const MembershipSchema = new Schema(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    golferId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "left", "removed"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

MembershipSchema.index({ clubId: 1, golferId: 1 }, { unique: true });

const MembershipModel = model("Membership", MembershipSchema);

export default MembershipModel;
