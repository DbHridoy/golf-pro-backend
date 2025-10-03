import { Schema } from "mongoose";
import { transform } from "zod/v4";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

import type { IGolferProfile } from "./golfer.interface";

const GolferProfileSchema = createPaginatedSchema<IGolferProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: "User",
    index: true,
  },
 

  // Privacy settings
  isPostPublic: {
    type: Boolean,
    default: true,
  },

 


  // Activity tracking
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },

  isOnline: {
    type: Boolean,
    default: false,
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

// Indexes for performance
GolferProfileSchema.index({ userId: 1 }, { unique: true });
GolferProfileSchema.index({ fullName: "text" });
GolferProfileSchema.index({ country: 1, city: 1 });
GolferProfileSchema.index({ location: "2dsphere" }); // Geospatial index
GolferProfileSchema.index({ isProfilePublic: 1 });
GolferProfileSchema.index({ lastActiveAt: -1 });
GolferProfileSchema.index({ ghinNumber: 1 }, { sparse: true });

// Virtual for age calculation
GolferProfileSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Virtual for friend count
GolferProfileSchema.virtual("friendCount").get(function () {
  return this.friends ? this.friends.length : 0;
});

// Virtual for club membership count
GolferProfileSchema.virtual("clubMembershipCount").get(function () {
  return this.clubMemberships ? this.clubMemberships.length : 0;
});

// Pre-save middleware to update lastActiveAt
GolferProfileSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastActiveAt = new Date();
  }
  next();
});

export const GolferProfileModel = createPaginatedModel<IGolferProfile>(
  "GolferProfile",
  GolferProfileSchema,
);
export default GolferProfileModel;
