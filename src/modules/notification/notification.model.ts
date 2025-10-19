import { model, Schema, Types } from "mongoose";

const NotificationSchema = new Schema({
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
    body: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    data: {
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
