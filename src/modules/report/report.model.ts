import { model, Schema } from "mongoose";

const ReportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    reportedClubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: false,
      default: null,
    },
    reportedPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false,
      default: null,
    },
    contentType: {
      type: String,
      enum: {
        values: ["profile", "post"],
        message: "Content type must be either profile or post",
      },
      required: true,
    },
    targetType: {
      type: String,
      enum: {
        values: ["golfer", "club"],
        message: "Target type must be either golfer or club",
      },
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      required: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    adminNote: {
      type: String,
      trim: true,
      default: null,
      maxlength: [1000, "Admin note cannot exceed 1000 characters"],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: Record<string, any>, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

ReportSchema.index(
  { reporterId: 1, reportedUserId: 1, reportedPostId: 1, contentType: 1 },
  {
    unique: true,
    sparse: true,
    name: "unique_user_report",
  },
);

ReportSchema.index(
  { reporterId: 1, reportedClubId: 1, contentType: 1 },
  {
    unique: true,
    sparse: true,
    name: "unique_club_report",
  },
);

ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ reportedUserId: 1 });
ReportSchema.index({ reportedClubId: 1 });
ReportSchema.index({ reportedPostId: 1 });
ReportSchema.index({ adminId: 1 });
ReportSchema.index({ isResolved: 1 });
ReportSchema.index({ createdAt: -1 });

const ReportModel = model("Report", ReportSchema);

export default ReportModel;
