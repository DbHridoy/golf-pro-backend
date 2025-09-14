// file: src/modules/user/user.controller.ts
import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { zParse } from "@/utils/validators.utils";

import type { ChangePasswordInput, GetUserByIdInput, GetUsersInput, UpdateUserInput } from "./user.type";

import { changePasswordSchema, getUserByIdSchema, getUsersSchema, updateUserSchema } from "./user.schema";
import { userService } from "./user.service";

export class UserController {
  /**
   * Get paginated users
   * GET /users
   */
  getUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { query }: GetUsersInput = await zParse(getUsersSchema, req);

    const result = await userService.getUsers(query);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Get user by ID
   * GET /users/:id
   */
  getUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { params }: GetUserByIdInput = await zParse(getUserByIdSchema, req);

    const result = await userService.getUserById(params.id);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Update user profile
   * PATCH /users/:id
   */
  updateUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { params, body }: UpdateUserInput = await zParse(updateUserSchema, req);

    const result = await userService.updateUser(params.id, body);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Change user password
   * PATCH /users/:id/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { params, body }: ChangePasswordInput = await zParse(changePasswordSchema, req);

    const result = await userService.changePassword(params.id, body);

    return res.status(HTTPSTATUS.OK).json(result);
  });
}

export const userController = new UserController();
