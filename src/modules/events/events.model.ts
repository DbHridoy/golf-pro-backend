import { model, Schema } from "mongoose";

const EventInvitationSchema = new Schema({
  invitee: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  inviter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "cancelled"],
    default: "pending",
  },
  message: String,
  respondedAt: Date,
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

const EventSchema = new Schema({
  // ... existing fields ...
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  invitations: [EventInvitationSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  // ... rest of your schema ...
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

// Add methods
EventSchema.methods.isUserInvited = function (userId: string) {
  return this.invitations.some(inv =>
    inv.invitee.equals(userId) && inv.status === "pending",
  );
};

EventSchema.methods.isMember = function (userId: string) {
  return this.members.some(memberId => memberId.equals(userId));
};

export default model("Event", EventSchema);
