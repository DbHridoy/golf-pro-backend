import type { Secret, SignOptions } from "jsonwebtoken";

import jwt from "jsonwebtoken";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { env } from "@/env";

import { UnauthorizedException } from "./app-error.utils";

class JWT {
  private readonly jwtSecret: Secret;
  private readonly jwtRefreshSecret: Secret;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = env.JWT_SECRET as Secret;
    this.jwtRefreshSecret = env.JWT_REFRESH_SECRET as Secret;
    this.accessTokenExpiry = env.JWT_EXPIRY as string;
    this.refreshTokenExpiry = env.JWT_REFRESH_EXPIRY as string;
  }

  generateTokens(payload: object) {
    const accessTokenOptions: SignOptions = {
      expiresIn: this.accessTokenExpiry as jwt.SignOptions["expiresIn"],

    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: this.refreshTokenExpiry as jwt.SignOptions["expiresIn"],
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, accessTokenOptions);
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, refreshTokenOptions);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret);
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error: unknown) {
      throw new UnauthorizedException("Invalid or expired access token", ErrorCodeEnum.AUTH_TOKEN_INVALID);
    }
  }
}

export const jwtUtils = new JWT();
