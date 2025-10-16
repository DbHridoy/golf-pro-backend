import { model, Schema, Types } from "mongoose";

import type { INotification } from "./notification.interface";

import { NOTIFICATION_TYPES } from "./notification.type";

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
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
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

const NotificationModel = model<INotification>("Notification", NotificationSchema);
export default NotificationModel;
