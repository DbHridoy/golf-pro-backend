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
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Full name cannot exceed 100 characters"],
  },

  gender: {
    type: String,
    required: true,
    enum: {
      values: ["male", "female", "other", "prefer_not_to_say"],
      message: "Gender must be male, female, other, or prefer_not_to_say",
    },
  },

  dateOfBirth: {
    type: Date,
    require: true,
    validate: {
      validator(value: Date) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return age >= 2 && age <= 120;
      },
      message: "Age must be between (1 + 1)=2 and 120 years",
    },
  },

  // location fields
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Country name cannot exceed 100 characters"],
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "City name cannot exceed 100 characters"],
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      validate: {
        validator(coords: number[]) {
          return coords.length === 2
            && coords[0] >= -180 && coords[0] <= 180 // longitude
            && coords[1] >= -90 && coords[1] <= 90; // latitude
        },
        message: "Invalid coordinates format",
      },
    },

  },

  // Images
  profileImage: {
    type: String,
    trim: true,
    validate: {
      validator(url: string) {
        if (!url)
          return true;
        // eslint-disable-next-line regexp/no-unused-capturing-group
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: "Invalid profile image URL format",
    },
  },

  coverImage: {
    type: String,
    trim: true,
    validate: {
      validator(url: string) {
        if (!url)
          return true; // Optional field
        // eslint-disable-next-line regexp/no-unused-capturing-group
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: "Invalid cover image URL format",
    },
  },

  // Golf-specific data
  ghinNumber: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
    validate: {
      validator(ghin: string) {
        if (!ghin)
          return true; // Optional field
        return /^\d{7}$/.test(ghin); // 7-digit GHIN number
      },
      message: "GHIN number must be 7 digits",
    },
  },

  handicapIndex: {
    type: Number,
    min: [0, "Handicap index cannot be negative"],
    max: [54, "Handicap index cannot exceed 54"],
  },

  // Privacy settings
  isProfilePublic: {
    type: Boolean,
    default: true,
  },

  // Social references
  clubMemberships: [{
    type: Schema.Types.ObjectId,
    ref: "Club",
  }],

  friends: [{
    type: Schema.Types.ObjectId,
    ref: "GolferProfile",
  }],

  friendRequests: [{
    type: Schema.Types.ObjectId,
    ref: "FriendRequest",
  }],

  clubMemberRequests: [{
    type: Schema.Types.ObjectId,
    ref: "ClubMemberRequest",
  }],

  notifications: [{
    type: Schema.Types.ObjectId,
    ref: "Notification",
  }],

  // Additional profile fields
  bio: {
    type: String,
    trim: true,
    maxlength: [500, "Bio cannot exceed 500 characters"],
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
