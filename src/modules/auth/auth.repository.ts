import type { IUser } from "@/modules/user/user.interface";

import UserModel from "@/modules/user/user.model";
import { NotFoundException } from "@/utils/app-error.utils";

/**
 * Find user by email with password field included
 */
export async function findUserByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email: email.toLocaleLowerCase() });
}

/**
 * Find user by ID without password
 */
export async function findUserById(id: string): Promise<IUser | null> {
  return UserModel.findById(id).lean();
};

/**
 * Create new user account
 */
export async function createUser(userData: Partial<IUser>): Promise<IUser> {
  const user = new UserModel(userData);
  await user.save();

  return UserModel.findById(user._id).lean() as Promise<IUser>;
}

/**
 * Update user's email verification status
 */
export async function updateEmailVerification(userId: string, isVerified: boolean): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    isEmailVerified: isVerified,
  });
}

/**
 * Check if user exists and is active
 */
export async function validateUserStatus(userId: string): Promise<IUser> {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (!user.isActive) {
    throw new NotFoundException("User account is deactivated");
  }

  return user;
}

/**
 * [ALERT]: Optional field, If not need then It will remove.
 * Update user's last login timestamp (optional)
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    lastLoginAt: new Date(),
  });
}
