import type { IUser } from "@/modules/user/user.interface";

import { NotFoundException } from "@/utils/app-error.utils";
import { PaginationHelper } from "@/utils/pagination-helper";

import UserModel from "./user.model";

export class UserRepository {
  /**
   * Get paginated users with search and filters
   */

  async getUsers(query: any) {
    const paginateOptions = PaginationHelper.parsePaginationParams(query);
    const searchFields = ["email"];

    const filter = PaginationHelper.createSearchFilter(query, searchFields);

    const result = await UserModel.paginate(filter, paginateOptions);

    return PaginationHelper.formatResponse(result);
  }

  /**
   * Find user by ID
   */
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

  /**
   * Update user password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: { password: hashedPassword } },
      { new: true },
    ).lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}

export const userRepository = new UserRepository();
