// In events.model.ts
import { Schema, model, Types } from "mongoose";

const EventInvitationSchema = new Schema({
  invitee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  inviter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "declined", "cancelled"], 
    default: "pending" 
  },
  message: String,
  respondedAt: Date
}, { timestamps: true, _id: true });

const EventSchema = new Schema({
  // ... existing fields ...
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  invitations: [EventInvitationSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  // ... rest of your schema ...
}, { timestamps: true });

// Add methods
EventSchema.methods.isUserInvited = function(userId: string) {
  return this.invitations.some(inv => 
    inv.invitee.equals(userId) && inv.status === 'pending'
  );
};

EventSchema.methods.isMember = function(userId: string) {
  return this.members.some(memberId => memberId.equals(userId));
};

export default model("Event", EventSchema);