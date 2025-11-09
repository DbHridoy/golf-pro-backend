import type { IUser } from "@/modules/user/user.interface";
import type { PaginatedResponse, PaginationQuery } from "@/ts/pagination.types";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { logger } from "@/middlewares/pino-logger";
import {
  BadRequestException,
  NotFoundException,
} from "@/utils/app-error.utils";
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

  async getUsers(query: PaginationQuery): Promise<PaginatedResponse<IUser>> {
    const paginateOptions = PaginationHelper.parsePaginationParams(query);

    // console.log("Response from repository function");
    const searchFilter = PaginationHelper.createSearchFilter(
      query,
      this.searchableFields
    );

    // console.log("Searhc filters: ", searchFilter);

    logger.info(paginateOptions, " ", searchFilter, "Debugging");

    if (query.role && typeof query.role === "string") {
      const validRoles = ["golfer", "golf_club", "admin"];
      if (validRoles.includes(query.role)) {
        searchFilter.role = query.role;
      }
    }

    if (query.isActive !== undefined) {
      searchFilter.isActive = Boolean(query.isActive);
    }

    if (query.isEmailVerified !== undefined) {
      searchFilter.isEmailVerified =
        query.isEmailVerified === "true" || query.isEmailVerified === true;
    }

    if (paginateOptions.sort) {
      const sortKeys = Object.keys(paginateOptions.sort);

      const invalidSortFields = sortKeys.filter(
        (field) => !this.sortableFields.includes(field)
      );

      if (invalidSortFields.length > 0) {
        logger.warn(`Invalid sort fields: ${invalidSortFields.join(", ")}`);
        throw new BadRequestException(
          `Invalid sort fields: ${invalidSortFields.join(", ")}`,
          ErrorCodeEnum.PAGINATION_INVALID_SORT_FIELD
        );
      }
    }
    const result = await UserModel.paginate(searchFilter, {
      ...paginateOptions,
      lean: false,
      leanWithId: false,
      populate: paginateOptions.populate,
    });
    logger.debug(result);
    return PaginationHelper.formatResponse(result);
  }

  async findUserById(userId: string, options: { select?: string } = {}) {
    let query = UserModel.findOne({ _id: userId, isActive: true });

    if (options.select) {
      query = query.select(options.select);
    }

    const user = await query.lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true }
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
    if (!user) throw new Error("User not found");

    // Toggle the status
    const toggledUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { isActive: !user.isActive },
      { new: true }
    ).lean();

    return toggledUser;
  }
}

export const userRepository = new UserRepository();
