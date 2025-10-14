import type mongoose from "mongoose";

import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import type { IUser } from "@/modules/user/user.interface";

import { transporter } from "@/config/nodemailer.config";
import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { env } from "@/env";
import { logger } from "@/middlewares/pino-logger";
import {
  BadRequestException,
  UnauthorizedException,
} from "@/utils/app-error.utils";
import hashingUtils from "@/utils/hash.utils";
import { jwtUtils } from "@/utils/jwt.utils";

import type { AuthResponse, JWTPayload, RefreshTokenResponse } from "./auth.interface";
import type { LoginInput, RegisterInput } from "./auth.type";

import AdminModel from "../admin/admin.model";
import ClubModel from "../club/club.model";
import GolferModel from "../golfer/golfer.model";
import { authRepository } from "./auth.repository";
import OTPModel from "./otp.model";

export class AuthService {
  // Register
  async register(registerData: RegisterInput["body"]) {
    // Check if user already exists
    const { email, password, role } = registerData;

    const existingUser = await authRepository.emailExists(email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists", ErrorCodeEnum.RESOURCE_CONFLICT);
    }

    const hashedPassword = await hashingUtils.hashPassword(password);

    const userData: Partial<IUser> = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive: true,
      isEmailVerified: false,
    };
    const user = await authRepository.createUser(userData);
    if (userData.role === "golfer") {
      const golfer = new GolferModel({ userId: user?._id });
      await golfer.save();
    }
    else if (userData.role === "golf_club") {
      const club = new ClubModel({ userId: user?._id });
      await club.save();
    }
    else {
      const admin = new AdminModel({ userId: user?._id });
      await admin.save();
    }
    const tokenPayload = {
      userId: user?._id,
      email: user?.email,
      role: user?.role,
    };

    const { accessToken, refreshToken } = jwtUtils.generateTokens(tokenPayload);

    return {
      success: true,
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          role: user?.role,
          isActive: user?.isActive,
          isEmailVerified: user?.isEmailVerified,
        },
        accessToken,
        refreshToken,
      },
      message: "User registered successfully. Please verify your email.",
    };
  }

  // login service
  async login(loginData: LoginInput["body"]) {
    const { email, password } = loginData;

    const user = await authRepository.findUserByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password", ErrorCodeEnum.AUTH_INVALID_CREDENTIALS);
    }

    const isPasswordValid = await hashingUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password", ErrorCodeEnum.AUTH_INVALID_CREDENTIALS);
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = jwtUtils.generateTokens(tokenPayload);

    return {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      },
      message: "Login successful",
    };
  }

  // ghin login
  async ghinLogin({ ghinNo, ghinPassword }) {
    try {
      const payload = {
        user: {
          email_or_ghin: ghinNo,
          password: ghinPassword,
        },
        token: "123",
      };

      const response = await axios.post(
        "https://api.ghin.com/api/v1/golfer_login.json",
        payload,
      );

      console.log("Full response:", response.data);

      // ✅ golfers is an array — grab the first item
      const golfer = response.data?.golfer_user?.golfers?.[0];
      const ghinData = golfer?.display;
      const userData = {

      };
      return ghinData || { error: "Invalid data format" };
    }
    catch (err) {
      if (err.response) {
        console.error("Error response:", err.response.status, err.response.data);
        return { error: err.response.data };
      }
      else if (err.request) {
        console.error("No response received:", err.request);
        return { error: "No response from server" };
      }
      else {
        console.error("Axios error:", err.message);
        return { error: err.message };
      }
    }
  }

  // refresh token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await authRepository.findUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedException("User not found", ErrorCodeEnum.AUTH_USER_NOT_FOUND);
    }

    const tokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = this.generateTokens(tokenPayload);

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: "Token refreshed successfully",
    };
  }

  // utility methods

 

  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtRefreshSecret) as JWTPayload;
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error) {
      throw new UnauthorizedException("Invalid or expired refresh token", ErrorCodeEnum.AUTH_TOKEN_INVALID);
    }
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  async resetPassword(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Save or update OTP in DB
    await OTPModel.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true },
    );

    try {
      await transporter.sendMail({
        from: `"My App" <${env.GMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        html: `
        <h3>Password Reset</h3>
        <p>Your OTP code is: <b>${otp}</b></p>
        <p>This code will expire in 5 minutes.</p>
      `,
      });

      return { success: true, message: "OTP sent successfully" };
    }
    catch (error) {
      console.error("Email error:", error);
      return { success: false, message: "Failed to send OTP" };
    }
  }

  async setNewPassword(userId: string, oldPassword: string, newPassword: string) {
    logger.info(`setNewPassword called with userId: ${userId}, oldPassword: ${oldPassword}, newPassword: ${newPassword}`);
    // Find user by ID
    const user = await authRepository.findUserById(userId, true);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    logger.info(2);
    // Compare old password
    logger.info(3);
    logger.info(user);
    const isMatch = await this.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return { success: false, message: "Old password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await authRepository.updateUserPassword(userId, hashedPassword);

    return { success: true, message: "Password updated successfully" };
  }
}

export const authService = new AuthService();
