import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      default: null,
      max_length: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["golfer", "golf_club", "admin"],
        message: "Role must be either golfer, golf_club, or admin",
      },
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    // USGA Handicap Index
    handicapIndex: {
      type: Number,
      required: false,
      min: [0, "Handicap index cannot be negative"],
      max: [54, "Handicap index cannot exceed 54"],
      default: null,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(_doc: Record<string, any>, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);
UserSchema.virtual("golfer", {
  ref: "Golfer",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});
UserSchema.virtual("admin", {
  ref: "Admin",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});
UserSchema.virtual("club", {
  ref: "Club",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

UserSchema.index({ email: 1 }, { unique: true });

export const UserModel = model("User", UserSchema);

export default UserModel;
