import type { BaseDocument } from "@/utils/base-schema.utils";

export interface IUser extends BaseDocument {
  email: string;
  password: string;
  role: "golfer" | "golf_club" | "admin";
  isActive: boolean;
  handicapIndex?: number;
  isEmailVerified: boolean;
  clubId?: string;
  fcmToken?: string;
}
