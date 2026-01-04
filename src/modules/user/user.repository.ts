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

import { authService } from "../auth/auth.service";
import ClubModel from "../club/club.model";
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

  createClub = async (fullName: string, email: string, password: string) => {
    // const club = await UserModel.create({ fullName, email, password, role: "golf_club" });
    const club =await authService.register({ fullName, email, password, role: "golf_club" });
    // const clubProfile = await ClubModel.create({ userId: club.data.user.id });
    return club;
  };

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
      .populate([
        {
          path: "golfer",
        },
        {
          path: "club",
          populate: {
            path: "manager",
          },
        },
        {
          path: "admin",
        },
      ])
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

  getAllClubs = async () => {
    const clubs = await UserModel
      .find({ role: "golf_club" })
      .populate({
        path: "club",
        populate: {
          path: "manager",
        },
      })
      .lean();

    const formattedClubs
      = clubs.map((club) => {
        const roleData = club.club;

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
          _id: club._id,
          fullName: club.fullName,
          email: club.email,
          role: club.role,
          isActive: club.isActive,
          handicapIndex: club.handicapIndex,
          createdAt: club.createdAt,
          updatedAt: club.updatedAt,

          // 🔥 merged at root
          ...cleanRoleData,
        };
      });
    return formattedClubs;
  };

  getAllGolfers = async () => {
    const golfers = await UserModel.find({ role: "golfer" }).populate({
      path: "golfer",
    }).lean();
    return golfers;
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
