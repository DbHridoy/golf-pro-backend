import { model, Schema, Types } from "mongoose";

const NotificationSchema = new Schema({
  recipientId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "membership_request",
      "membership_approved",
      "event_invitation",
      "event_reminder",
      "event_cancelled",
      "event_updated",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedEntityType: {
    type: String,
    enum: ["Event", "Membership", "Club"],
  },
  relatedEntityId: {
    type: Schema.Types.ObjectId,
  },
  payload: {
    type: Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

const NotificationModel = model("Notification", NotificationSchema);

export default NotificationModel;
