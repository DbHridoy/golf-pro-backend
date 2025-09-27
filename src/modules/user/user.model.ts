import type { IUser } from "@/modules/user/user.interface";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

const UserSchema = createPaginatedSchema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["golfer", "golf_club", "system_admin"],
        message: "Role must be either golfer, golf_club, or system_admin",
      },
      index: true,
    },
    isActive: { type: Boolean, required: false, default: true, index: true },
    handicapIndex: {
      type: Number,
      required: false,
      min: [0, "Handicap index cannot be negative"],
      max: [54, "Handicap index cannot exceed 54"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: Record<string, any>, ret: Record<string, any>) {
        delete ret.password;
        return ret;
      },
    },
  },
);

UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });

export const UserModel = createPaginatedModel<IUser>("User", UserSchema);
export default UserModel;
