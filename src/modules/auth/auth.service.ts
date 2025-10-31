import axios from "axios";

import { transporter } from "@/config/nodemailer.config";
import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { env } from "@/env";
import { logger } from "@/middlewares/pino-logger";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@/utils/app-error.utils";
import hashingUtils from "@/utils/hash.utils";
import { jwtUtils } from "@/utils/jwt.utils";

import AdminModel from "../admin/admin.model";
import ClubModel from "../club/club.model";
import GolferModel from "../golfer/golfer.model";
import { authRepository } from "./auth.repository";
import OTPModel from "./otp.model";

export class AuthService {
  // Register
  async register(data: any) {
    const { fullName, email, password, role } = data;
    const existingUser = await authRepository.findUserByEmail(email!);

    if (existingUser) {
      throw new BadRequestException(
        "User with this email already exists",
        ErrorCodeEnum.RESOURCE_CONFLICT,
      );
    }

    const hashedPassword = await hashingUtils.hashPassword(password!);

    const userData = {
      fullName,
      email,
      password: hashedPassword,
      role,
      isActive: true,
    };

    const user = await authRepository.registerUser(userData);

    // Create dependent entity
    switch (user?.role) {
      case "golfer":
        await new GolferModel({ userId: user._id, fullName: user.fullName }).save();
        break;
      case "golf_club":
        await new ClubModel({ userId: user._id, clubName: user.fullName }).save();
        break;
      default:
        await new AdminModel({ userId: user?._id, fullName: user?.fullName }).save();
        break;
    }

    const payload = {
      userId: user!._id,
      email: user!.email,
      role: user!.role,
    };

    const { accessToken, refreshToken } = jwtUtils.generateTokens(payload);

    return {
      success: true,
      data: {
        user: {
          id: user!._id,
          fullName: user!.fullName,
          email: user!.email,
          role: user!.role,
          isActive: user!.isActive,
          isEmailVerified: user!.isEmailVerified,
        },
        accessToken,
        refreshToken,
      },
      message: "User registered successfully. Please verify your email.",
    };
  }

  // login service
  async login(loginData: any) {
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
      fullName: user.fullName,
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
          fullName: user.fullName,
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

  // refresh token
  async refreshToken(token: string) {
    const payload = jwtUtils.verifyRefreshToken(token) as { userId: string };

    if (!payload || typeof payload !== "object" || !("userId" in payload)) {
      throw new UnauthorizedException("Invalid token payload", ErrorCodeEnum.AUTH_TOKEN_INVALID);
    }

    const user = await authRepository.findUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedException("User not found", ErrorCodeEnum.AUTH_USER_NOT_FOUND);
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const tokens = jwtUtils.generateTokens(tokenPayload);

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: "Token refreshed successfully",
    };
  }

  async sendOtp(email: string) {
    const user = await authRepository.findUserByEmail(email, true);

    if (!user) {
      throw new NotFoundException("User not found", ErrorCodeEnum.AUTH_USER_NOT_FOUND);
    }
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

  async verifyOtp(email: string, otp: string) {
    const record = await authRepository.matchOtp(email, otp);
    if (!record) {
      return { success: false, message: "Invalid OTP" };
    }

    if (record.expiresAt < new Date()) {
      return { success: false, message: "OTP expired" };
    }

    // Optionally, delete OTP after verification
    await authRepository.deleteOtp(record._id);

    return { success: true, message: "OTP verified successfully" };
  }

  async setNewPassword(email: string, newPassword: string) {
    logger.info(`from service layer - email: ${email}, newPassword: ${newPassword}`);
    // Find user by email
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Hash new password
    const hashedPassword = await hashingUtils.hashPassword(newPassword);

    // Update user password
    await authRepository.updateUserPassword(user._id, hashedPassword);

    return { success: true, message: "Password updated successfully" };
  }

  // ghin login
  async ghinLogin({ ghinNo, ghinPassword }) {
    logger.info(`from service layer - ghinNo: ${ghinNo}, ghinPassword: ${ghinPassword}`);
    try {
      const payload = {
        user: {
          email_or_ghin: ghinNo,
          password: ghinPassword,
        },
        token: "123",
      };
      logger.info(`from service layer - payload: ${JSON.stringify(payload)}`);
      const response = await axios.post(
        "https://api.ghin.com/api/v1/golfer_login.json",
        payload,
      );

      // ✅ golfers is an array — grab the first item
      const golfer = response.data?.golfer_user?.golfers?.[0];
      let user = await authRepository.findUserByEmail(golfer.email, true);
      if (!user) {
        const hashedPassword = await hashingUtils.hashPassword(ghinPassword!); // Use ghinPassword!);
        const newUser = {
          fullName: golfer.player_name,
          email: golfer.email,
          password: hashedPassword,
          role: "golfer",
          handicapIndex: golfer.display,
          isActive: true,
        };
        logger.info(`from service layer - newUser: ${JSON.stringify(newUser)}`);
        user = await authRepository.registerUser(newUser);
      }
      else {
        const hashedPassword = await hashingUtils.hashPassword(ghinPassword!); // Use ghinPassword!);

        const newUser = {
          fullName: golfer.player_name,
          email: golfer.email,
          password: hashedPassword,
          role: "golfer",
          handicapIndex: golfer.display,
          isActive: true,
        };

        await authRepository.updateUser(user.email, newUser);
      }
      // const user = await authRepository.findOrCreateUser(userData.email, userData.fullName);
      const tokenPayload = {
        fullName: user.fullName,
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
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            handicapIndex: user.handicapIndex,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        },
        message: "Login successful",
      };
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
}

export const authService = new AuthService();
