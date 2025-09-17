import type { IUser } from "@/modules/user/user.interface";

import { logger } from "@/middlewares/pino-logger";
import { NotFoundException } from "@/utils/app-error.utils";
import { PaginationHelper } from "@/utils/pagination-helper";

import UserModel from "./user.model";

export class UserRepository {
  // Get paginated users with search and filters
  async getUsers(query: any) {
    const paginateOptions = PaginationHelper.parsePaginationParams(query);
    const searchFields = ["email"];

    const filter = PaginationHelper.createSearchFilter(query, searchFields);

    const result = await UserModel.paginate(filter, paginateOptions);
    logger.info(result, "Debugging rs");
    const result1 = PaginationHelper.formatResponse(result);
    logger.warn(result1, "Debugging rs1");
    return result1;
  }

  async findUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ _id: userId, isActive: true }).lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await UserModel.findOne({ _id: userId, isActive: true }).lean();
    return !!user;
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  /**
   * Get user with password (for password change)
   */
  async getUserWithPassword(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ _id: userId, isActive: true })
      .select("+password")
      .lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<IUser> {
    return await this.updateUser(userId, { password: hashedPassword });
  }

  async updateEmailVerification(userId: string): Promise<IUser> {
    return await this.updateUser(userId, { isEmailVerified: true });
  }

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

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }
}

export const userRepository = new UserRepository();
