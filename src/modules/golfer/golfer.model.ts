import { Schema } from "mongoose";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

import type { IGolferProfile } from "./golfer.interface";

const GolferSchema = createPaginatedSchema<IGolferProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
      index: true,
    },
    fullName: { type: String, trim: true, default: null, maxlength: 100 },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: null },
    dateOfBirth: {
      type: Date,
      default: null,
      validate: {
        validator(value: Date | null): boolean {
          if (!value)
            return true;
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          return age >= 2 && age <= 120;
        },
        message: "Age must be between 2 and 120 years",
      },
    },
    country: { type: String, default: null, trim: true, maxlength: 100 },
    city: { type: String, default: null, trim: true, maxlength: 100 },
    address: { type: String, default: null, trim: true, maxlength: 200 },
    profileImage: { type: String, trim: true, default: null },
    coverImage: { type: String, trim: true, default: null },
    ghinNumber: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator(ghin: string) {
          if (!ghin)
            return true;
          return /^\d{7}$/.test(ghin);
        },
        message: "GHIN number must be 7 digits",
      },
    },
    handicapIndex: { type: Number, default: null, min: 0, max: 54 },
    isProfilePublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

const GolferModel = createPaginatedModel<IGolferProfile>("Golfer", GolferSchema);

(async () => {
  await GolferModel.syncIndexes();
})();

export default GolferModel;
