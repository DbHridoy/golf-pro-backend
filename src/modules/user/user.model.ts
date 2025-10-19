import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    default: null,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
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
  handicapIndex: {
    type: Number,
    required: false,
    min: [0, "Handicap index cannot be negative"],
    max: [54, "Handicap index cannot exceed 54"],
  },
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

UserSchema.index({ email: 1 }, { unique: true });

export const UserModel = model("User", UserSchema);

export default UserModel;
