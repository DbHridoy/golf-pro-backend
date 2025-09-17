import type mongoose from "mongoose";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import type { IUser } from "@/modules/user/user.interface";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { env } from "@/env";
import {
  BadRequestException,
  UnauthorizedException,
} from "@/utils/app-error.utils";

import type { AuthResponse, JWTPayload, RefreshTokenResponse } from "./auth.interface";
import type { LoginInput, RegisterInput } from "./auth.type";

import { authRepository } from "./auth.repository";

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly saltRounds: number;

  constructor() {
    this.jwtSecret = env.JWT_SECRET as string;
    this.jwtRefreshSecret = env.JWT_REFRESH_SECRET as string;
    this.accessTokenExpiry = env.JWT_EXPIRY as string;
    this.refreshTokenExpiry = env.JWT_REFRESH_EXPIRY as string;
    this.saltRounds = env.SALT_ROUNDS;
  }

  // Authentication methods
  async register(registerData: RegisterInput["body"]): Promise<AuthResponse> {
    const { email, password, role } = registerData;

    const existingUser = await authRepository.emailExists(email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists", ErrorCodeEnum.RESOURCE_CONFLICT);
    }

    const hashedPassword = await this.hashPassword(password);

    const userData: Partial<IUser> = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive: true,
      isEmailVerified: false,
    };

    const user = await authRepository.createUser(userData);

    const tokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = this.generateTokens(tokenPayload);

    return {
      success: true,
      data: {
        user: {
          id: (user._id as mongoose.Types.ObjectId).toString(),
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      },
      message: "User registered successfully. Please verify your email.",
    };
  }

  // login service
  async login(loginData: LoginInput["body"]): Promise<AuthResponse> {
    const { email, password } = loginData;

    const user = await authRepository.findUserByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password", ErrorCodeEnum.AUTH_INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password", ErrorCodeEnum.AUTH_INVALID_CREDENTIALS);
    }

    const tokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = this.generateTokens(tokenPayload);

    return {
      success: true,
      data: {
        user: {
          id: (user._id as mongoose.Types.ObjectId).toString(),
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

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateTokens(payload: Omit<JWTPayload, "iat" | "exp">): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.refreshTokenExpiry,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error: unknown) {
      throw new UnauthorizedException("Invalid or expired access token", ErrorCodeEnum.AUTH_TOKEN_INVALID);
    }
  }

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
}

export const authService = new AuthService();
