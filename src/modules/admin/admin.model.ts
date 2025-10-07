import mongoose, { Schema } from "mongoose";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

import type { IAdminProfile } from "./admin.interface";

const AdminProfileSchema = createPaginatedSchema<IAdminProfile>({
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
  notifications: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    default: null,
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

export const AdminProfileModel = createPaginatedModel<IAdminProfile>(
  "AdminProfile",
  AdminProfileSchema,
);

export default AdminProfileModel;
