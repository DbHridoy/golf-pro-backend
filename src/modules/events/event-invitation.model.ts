import { model, Schema } from "mongoose";

const EventInvitationSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  golferId: {
    type: Schema.Types.ObjectId,
    ref: "Golfer",
    required: true,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  invitationStatus: {
    type: String,
    enum: ["pending", "accepted", "declined", "expired"],
    default: "pending",
  },
  invitedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

EventInvitationSchema.index({ eventId: 1, golferId: 1 }, { unique: true });
EventInvitationSchema.index({ golferId: 1, invitationStatus: 1 });
EventInvitationSchema.index({ eventId: 1, invitationStatus: 1 });
EventInvitationSchema.index({ expiresAt: 1 });

const EventInvitationModel = model("EventInvitation", EventInvitationSchema);

export default EventInvitationModel;
