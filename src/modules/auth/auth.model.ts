import mongoose from "mongoose";

const { Schema } = mongoose;

// User Schema (Base for all user types)
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  userType: { type: String, enum: ["golfer", "golf_club", "system_admin"], required: true },
  authProvider: { type: String, enum: ["local", "google", "usga"], required: true },
  ghinNumber: { type: String, sparse: true },
  isActive: { type: Boolean, default: true },
  handicapIndex: { type: Number, required: true },
  isVerified: { type: Boolean, default: false }, // optional
}, { timestamps: true });
