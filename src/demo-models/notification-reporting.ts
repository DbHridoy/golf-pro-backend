// Notification Schema
const NotificationSchema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    required: true,
    enum: [
      "friend_request",
      "event_invitation",
      "membership_request",
      "new_message",
      "event_reminder",
      "leaderboard_update",
      "achievement",
      "system_announcement",
    ],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String },
}, { timestamps: true });

// Report Schema
const ReportSchema = new Schema({
  reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: "User" },
  reportedContent: { type: Schema.Types.ObjectId, ref: "Post" },
  reportType: {
    type: String,
    required: true,
    enum: [
      "inappropriate_behavior",
      "abusive_language",
      "cheating",
      "unsportsmanlike_conduct",
      "harassment",
      "impersonation",
      "spam",
      "rule_violation",
      "score_manipulation",
      "other",
    ],
  },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "reviewed", "resolved", "dismissed"], default: "pending" },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  adminAction: { type: String, enum: ["warning", "temporary_ban", "permanent_ban", "content_removal"] },
  adminNotes: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });
