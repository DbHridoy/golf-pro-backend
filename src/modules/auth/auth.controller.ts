import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { env } from "@/env";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import { zParse } from "@/utils/validators.utils";

import type {
  ChangeEmailInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshAuthInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.type";

import {
  changeEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshAuthSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
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

  /**
   * Forgot password
   * POST /auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: ForgotPasswordInput = await zParse(forgotPasswordSchema, req);
    logger.info(body);
    // TODO: Implement forgot password logic with email sending
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  });

  /**
   * Reset password
   * POST /auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: ResetPasswordInput = await zParse(resetPasswordSchema, req);
    logger.info(body);
    // TODO: Implement reset password logic
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Password reset successfully",
    });
  });

  /**
   * Verify email
   * POST /auth/verify-email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: VerifyEmailInput = await zParse(verifyEmailSchema, req);
    logger.info(body);
    // TODO: Implement email verification logic
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Email verified successfully",
    });
  });

  /**
   * Change email for authenticated user
   * POST /auth/change-email
   */
  changeEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: ChangeEmailInput = await zParse(changeEmailSchema, req);
    logger.info(body);
    // TODO: Implement change email logic
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Email change request sent. Please verify your new email.",
    });
  });
}

export const authController = new AuthController();
