import mongoose, { Schema } from "mongoose";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

import type { IGolferProfile } from "./golfer.interface";

const GolferProfileSchema = createPaginatedSchema<IGolferProfile>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
    index: true,
  },
  fullName: {
    type: String,
    trim: true,
    default: null,
    maxlength: [100, "Full name cannot exceed 100 characters"],
  },
  gender: {
    type: String,
    default: null,
    enum: {
      values: ["male", "female", "other", "prefer_not_to_say"],
      message: "Gender must be male, female, other, or prefer_not_to_say",
    },
  },
  dateOfBirth: {
    type: Date,
    default: null,
    validate: {
      validator(value: Date | null): boolean {
        if (!value)
          return true; // allow null values

        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return age >= 2 && age <= 120;
      },
      message: "Age must be between (1 + 1)=2 and 120 years",
    },
  },
  country: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, "Country name cannot exceed 100 characters"],
  },
  city: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, "City name cannot exceed 100 characters"],
  },
  address: {
    type: String,
    default: null,
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  profileImage: {
    type: String,
    trim: true,
    default: null,
    // validate: {
    //   validator(url: string|null) {
    //     if (!url)
    //       return true;
    //     // eslint-disable-next-line regexp/no-unused-capturing-group
    //     return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    //   },
    //   message: "Invalid profile image URL format",
    // },
  },
  coverImage: {
    type: String,
    trim: true,
    default: null,
    // validate: {
    //   validator(url: string|null) {
    //     if (!url)
    //       return true; // Optional field
    //     // eslint-disable-next-line regexp/no-unused-capturing-group
    //     return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    //   },
    //   message: "Invalid cover image URL format",
    // },
  },
  ghinNumber: {
    type: String,
    trim: true,
    default: null,
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
    default: null,
    min: [0, "Handicap index cannot be negative"],
    max: [54, "Handicap index cannot exceed 54"],
  },
  isProfilePublic: {
    type: Boolean,
    default: true,
  },
  clubs: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
    default: [],
  },
  isActive:{
    type: Boolean,
    default: true
  },
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
GolferProfileSchema.index({ fullName: "text" });
GolferProfileSchema.index({ country: 1, city: 1 });
GolferProfileSchema.index({ location: "2dsphere" }); // Geospatial index
GolferProfileSchema.index({ isProfilePublic: 1 });
GolferProfileSchema.index({ lastActiveAt: -1 });
GolferProfileSchema.index(
  { ghinNumber: 1 },
  { unique: true, partialFilterExpression: { ghinNumber: { $type: "string" } } },
);

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
(async () => {
  await GolferProfileModel.syncIndexes();
})();

export default GolferProfileModel;
