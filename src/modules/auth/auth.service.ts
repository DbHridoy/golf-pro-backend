import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import { HTTPSTATUS } from "@/config/http.config";
import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { env } from "@/env";
import { IUser } from "@/modules/user/user.interface";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@/utils/app-error.utils";

import type { AuthResponse, JWTPayload, RefreshTokenResponse } from "./auth.interface";
import type { ChangeEmailInput, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput, VerifyEmailInput } from "./auth.type";

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
      throw new UnauthorizedException("Invalid or expired access token", ErrorCodeEnum.AUTH_INVALID_TOKEN);
    }
  }
}
