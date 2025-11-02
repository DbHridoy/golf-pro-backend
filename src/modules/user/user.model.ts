import { model, Schema } from "mongoose";

const UserSchema = new Schema({
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
    default: null, // null until calculated
    min: -5.0, // Maximum handicap improvement
    max: 54.0, // Maximum handicap
  },
  // Handicap calculation metadata
  handicapLastUpdated: { type: Date },
  totalRoundsPosted: { type: Number, default: 0 },
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
