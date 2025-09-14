import bcrypt from "bcryptjs";

import { env } from "@/env";
import { BadRequestException, NotFoundException } from "@/utils/app-error.utils";

import type { ChangePasswordInput, GetUsersInput, UpdateUserInput } from "./user.type";

import { userRepository } from "./user.repository";

export class UserService {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = env.SALT_ROUNDS;
  }

  /**
   * Get paginated users
   */
  async getUsers(query: GetUsersInput["query"]) {
    return await userRepository.getUsers(query);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await userRepository.findUserById(userId);

    return {
      success: true,
      data: user,
      message: "User retrieved successfully",
    };
  }

  /**
   * Update user profile
   */

  async updateUser(userId: string, updateData: UpdateUserInput["body"]) {
    await userRepository.findUserById(userId);

    const updatedUser = await userRepository.updateUser(userId, updateData);

    return {
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: ChangePasswordInput["body"]) {
    const { currentPassword, newPassword } = passwordData;

    // Get user with password
    const user = await userRepository.getUserWithPassword(userId);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException("New password must be different from current password");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // Update password
    await userRepository.updatePassword(userId, hashedPassword);

    return {
      success: true,
      message: "Password changed successfully",
    };
  }
}

export const userService = new UserService();
