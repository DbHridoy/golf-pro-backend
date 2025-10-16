import bcrypt from "bcryptjs";

import { env } from "@/env";
import { logger } from "@/middlewares/pino-logger";
import { BadRequestException } from "@/utils/app-error.utils";

import type { ChangePasswordInput, GetUsersInput, UpdateUserInput } from "./user.type";

import { userRepository } from "./user.repository";
import { postRepository } from "../posts/posts.repository";

export class UserService {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = env.SALT_ROUNDS;
  }

  async getUsers(query: GetUsersInput["query"]) {
    const result = await userRepository.getUsers(query);
    return result;
  }

  async getUserById(userId: string) {
    const user = await userRepository.findUserById(userId);
    return {
      success: true,
      data: user,
      message: "User retrieved successfully",
    };
  }

  async updateUser(userId: string, updateData: UpdateUserInput["body"]) {
    await userRepository.findUserById(userId);
    const updatedUser = await userRepository.updateUser(userId, updateData);
    return {
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    };
  }

  async changePassword(userId: string, passwordData: ChangePasswordInput["body"]) {
    const { currentPassword, newPassword } = passwordData;

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
 async getUserMedia(userId: string) {
    // Get user's profile and cover images
    const user = await userRepository.findUserById(userId, {
      select: "profileImage coverImage"
    });

    // Get all posts by user with media
    const posts = await postRepository.getPostsByUserWithMedia(userId);

    // Extract all media URLs
    const media = {
      images: [] as string[],
      videos: [] as string[],
    };

    // Add profile and cover images if they exist
    if (user.profileImage) media.images.push(user.profileImage);
    if (user.coverImage) media.images.push(user.coverImage);

    // Add post media
    posts.forEach(post => {
      if (post.postImage) media.images.push(post.postImage);
      if (post.postVideo) media.videos.push(post.postVideo);
    });

    return media;
  }
}

export const userService = new UserService();
