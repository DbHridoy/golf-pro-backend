import type { IUser } from "@/modules/user/user.interface";
import type { PaginatedResponse, PaginationQuery } from "@/ts/pagination.types";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { logger } from "@/middlewares/pino-logger";
import {
  BadRequestException,
  NotFoundException,
} from "@/utils/app-error.utils";
import { buildDynamicSearch } from "@/utils/dynamic-search-utils";
import { PaginationHelper } from "@/utils/pagination-helper";

import UserModel from "./user.model";

export class UserRepository {
  private readonly searchableFields = ["email"]; // Add more searchable fields as needed
  private readonly sortableFields = [
    "email",
    "role",
    "createdAt",
    "updatedAt",
    "isActive",
  ];

  getUsers = async (query: PaginationQuery) => {
    const { filter, search, options } = buildDynamicSearch(UserModel, query);

    const users = await UserModel
      .find({ ...filter, ...search }, null, options)
      .populate("golfer club admin")
      .lean();

    const formattedUsers = users.map((user) => {
      const roleData
        = user.role === "golfer"
          ? user.golfer
          : user.role === "golf_club"
            ? user.club
            : user.role === "admin"
              ? user.admin
              : null;

      // remove duplicated / unwanted keys from roleData
      const {
        _id: roleId,
        userId,
        __v,
        createdAt: roleCreatedAt,
        updatedAt: roleUpdatedAt,
        ...cleanRoleData
      } = roleData || {};

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        handicapIndex: user.handicapIndex,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        // 🔥 merged at root
        ...cleanRoleData,
      };
    });

    return formattedUsers;
  };

  getUserById = async (userId: string) => {
    const user = await UserModel
      .findById(userId)
      .populate("golfer club admin")
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    const roleData
      = user.role === "golfer"
        ? user.golfer
        : user.role === "golf_club"
          ? user.club
          : user.role === "admin"
            ? user.admin
            : null;

    // clean role-specific metadata
    const {
      _id: roleId,
      userId: roleUserId,
      __v,
      createdAt: roleCreatedAt,
      updatedAt: roleUpdatedAt,
      ...cleanRoleData
    } = roleData || {};

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      handicapIndex: user.handicapIndex,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // 🔥 merged role fields at root
      ...cleanRoleData,
    };
  };

  // async findUserById(userId: string, options: { select?: string } = {}) {
  //   let query = UserModel.findOne({ _id: userId, isActive: true });

  //   if (options.select) {
  //     query = query.select(options.select);
  //   }

  //   const user = await query.lean();

  //   if (!user) {
  //     throw new NotFoundException("User not found");
  //   }

  //   return user;
  // }

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

  async userExists(userId: string): Promise<boolean> {
    const user = await UserModel.findOne({
      _id: userId,
      isActive: true,
    }).lean();
    return !!user;
  }

  async findUserByEmail(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }

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

  async toggleUserStatus(userId) {
    logger.info(`userid from userrepo ${userId}`);
    // Get the current user first
    const user = await UserModel.findById(userId);
    if (!user)
      throw new Error("User not found");

    // Toggle the status
    const toggledUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { isActive: !user.isActive },
      { new: true },
    ).lean();

    return toggledUser;
  }
}

export const userRepository = new UserRepository();
