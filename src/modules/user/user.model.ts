import { Schema } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ["golfer", "golf_club", "system_admin"] },
  isActive: { type: Boolean, required: false, default: true },
  handicapIndex: { type: Number, required: false },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, toJSON: {} });
