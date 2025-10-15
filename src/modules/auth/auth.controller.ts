import type { NextFunction, Request, Response } from "express";

import type {
  LoginInput,
  RefreshAuthInput,
} from "@/modules/auth/auth.type";

import { HTTPSTATUS } from "@/config/http.config";
import { env } from "@/env";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import {
  loginSchema,
  refreshAuthSchema,
} from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { zParse } from "@/utils/validators.utils";

export class AuthController {
  // Register
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // const { body } = await zParse(registerSchema, req);
    const { body } = req;
    logger.info(`from authcontroller: ${JSON.stringify(body)}`);

    const result = await authService.register(body);
    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

  // reset password
  sendOtp = asyncHandler (async (req, res) => {
    const { email } = req.body; // 6-digit OTP
    const result = await authService.sendOtp(email);
    logger.info(result);
    res.status(HTTPSTATUS.OK).json(result);
  });

  verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const record = await authService.verifyOtp(email, otp);
    return res.status(HTTPSTATUS.OK).json(record);
  });

  setNewPassword = asyncHandler(async (req, res) => {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // Basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Call service
    const result = await authService.setNewPassword(email, oldPassword, newPassword);

    return res.status(result.success ? HTTPSTATUS.OK : HTTPSTATUS.BAD_REQUEST).json(result);
  });

  // login
  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: LoginInput = await zParse(loginSchema, req);
    // logger.info("from authcontroller");

    const result = await authService.login(body);
    // logger.info("from authcontroller");

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

  // ghin login
  ghinLogin = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { ghinNo, ghinPassword } = req.body;
    const result = await authService.ghinLogin({ ghinNo, ghinPassword });
    return res.status(HTTPSTATUS.OK).json(result);
  });

  // generate refresh token
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

  // logout
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
