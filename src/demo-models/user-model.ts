import mongoose from "mongoose";

const { Schema } = mongoose;

// User Schema (Base for all user types)
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  userType: { type: String, enum: ["golfer", "golf_club", "admin"], required: true },
  authProvider: { type: String, enum: ["local", "google", "usga"], required: true },
  ghinNumber: { type: String, sparse: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Above schema are already used

// Golfer Profile Schema
const GolferProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  dateOfBirth: { type: Date, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  profileImage: { type: String },
  coverPhoto: { type: String },
  geneNumber: { type: String },
  ghinNumber: { type: String, sparse: true },
  handicapIndex: { type: Number, required: true },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  isProfilePublic: { type: Boolean, default: false },
  clubMembership: { type: Schema.Types.ObjectId, ref: "GolfClubProfile" },
  notificationsEnabled: { type: Boolean, default: true },
  friends: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
  friendRequests: {
    sent: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
    received: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
  },
  playingHistory: [{ type: Schema.Types.ObjectId, ref: "GameParticipation" }],
}, { timestamps: true });

// Golf Club Profile Schema
const GolfClubProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  clubName: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  clubImage: { type: String },
  clubPhoto: { type: String },
  description: { type: String },
  website: { type: String },
  phone: { type: String },
  handicapRating: { type: Number },
  worldRanking: { type: Number },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  members: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
  membershipRequests: {
    sent: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
    received: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
  },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
