import type { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { email } from "zod/v4";

import type {
  LoginInput,
  RefreshAuthInput,
  RegisterInput,
} from "@/modules/auth/auth.type";

import { HTTPSTATUS } from "@/config/http.config";
import { env } from "@/env";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import {
  loginSchema,
  refreshAuthSchema,
  registerSchema,
} from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { zParse } from "@/utils/validators.utils";

import AdminProfileModel from "../admin/admin.model";
import ClubProfileModel from "../club/club.model";
import GolferProfileModel from "../golfer/golfer.model";

export class AuthController {
  // Register
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: RegisterInput = await zParse(registerSchema, req);

    logger.info(body, "Registering user");

    const result = await authService.register(body);
    logger.info(result, "Registered user");
    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (result.data.user.role === "golfer") {
      const golfer = new GolferProfileModel({ userId: new mongoose.Types.ObjectId(result.data.user.id) });
      await golfer.save();
    }
    else if (result.data.user.role === "golf_club") {
      const club = new ClubProfileModel({ userId: result.data.user.id });
      await club.save();
    }
    else {
      const admin = new AdminProfileModel({ userId: new mongoose.Types.ObjectId(result.data.user.id) });
      await admin.save();
    }
    return res.status(HTTPSTATUS.CREATED).json({
      success: result.success,
      data: {
        user: result.data.user,
        accessToken: result.data.accessToken,
      },
      message: result.message,
    });
  });

  /**
   * Login user
   * POST /auth/login
   */
  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: LoginInput = await zParse(loginSchema, req);

    const result = await authService.login(body);

    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: result.success,
      data: {
        user: result.data.user,
        accessToken: result.data.accessToken,
      },
      message: result.message,
    });
  });

  /**
   * Refresh access token
   * POST /auth/refresh
   */

  refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { cookies }: RefreshAuthInput = await zParse(refreshAuthSchema, req);

    const result = await authService.refreshToken(cookies.jwt);

    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: result.success,
      data: {
        accessToken: result.data.accessToken,
      },
      message: result.message,
    });
  });

  /**
   * Logout user
   * POST /auth/logout
   */

  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}

export const authController = new AuthController();
