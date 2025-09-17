import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { env } from "@/env";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { zParse } from "@/utils/validators.utils";

import type {
  LoginInput,
  RefreshAuthInput,
  RegisterInput,
} from "./auth.type";

import {
  loginSchema,
  refreshAuthSchema,
  registerSchema,
} from "./auth.schema";
import { authService } from "./auth.service";

export class AuthController {
  /**
   * Register new user
   * POST /auth/register
   */

  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: RegisterInput = await zParse(registerSchema, req);

    const result = await authService.register(body);

    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
