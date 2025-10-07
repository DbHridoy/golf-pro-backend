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
        values: ["golfer", "golf_club", "admin"],
        message: "Role must be either golfer, golf_club, or admin",
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
    id: false, // disable default Mongoose id virtual
    toJSON: {
      virtuals: false,
      transform(_doc: any, ret: any) {
        ret.id = ret._id.toString(); // create id from _id
        delete ret._id;
        delete ret.__v; // remove _id
        delete ret.password; // remove password if needed
        return ret; // keep __v, createdAt, updatedAt
      },
    },
    toObject: { virtuals: false },
  },
);

UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });

export const UserModel = createPaginatedModel<IUser>("User", UserSchema);
export default UserModel;
