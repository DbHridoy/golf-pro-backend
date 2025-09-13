import type { IUser } from "@/modules/user/user.interface";

import UserModel from "@/modules/user/user.model";
import { NotFoundException } from "@/utils/app-error.utils";

export class AuthRepository {
/**
 * Find user by email (include password for authentication)
 */
  async findUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase(), isActive: true });

    if (includePassword) {
      query.select("+password");
    }

    return await query.exec();
  }

  /**
   * Find user by ID without password
   */
  async findUserById(userId: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ _id: userId, isActive: true });

    if (includePassword) {
      query.select("+password");
    }

    return await query.exec();
  };

  /**
   * Create new user account
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  /*
  * Update user data
  */

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  /**
   * Update user's email verification status
   */
  async updateEmailVerification(userId: string): Promise<IUser> {
    return await this.updateUser(userId, { isEmailVerified: true });
  }

  /**
   * Update password if user is active
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<IUser> {
    return await this.updateUser(userId, { password: hashedPassword });
  }

  // /**
  //  * Check if user email exists
  //  */
  // async emailExists(email: string): Promise<boolean> {
  //   const user = await UserModel.findOne({ email: email.toLowerCase() });
  //   return !!user;
  // }

  /**
   * Check if user exists and is active
   */
  async validateUserStatus(userId: string): Promise<IUser> {
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
  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }
}

export const authRepository = new AuthRepository();
