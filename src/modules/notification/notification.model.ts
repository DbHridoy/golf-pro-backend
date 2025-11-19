import { model, Schema, Types } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
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
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

const NotificationModel = model("Notification", NotificationSchema);

export default NotificationModel;
