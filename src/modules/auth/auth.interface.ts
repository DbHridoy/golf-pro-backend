import type { Schema } from "mongoose";

// JWT payload type
export interface JWTPayload {
  userId: Schema.Types.ObjectId;
  email: string;
  role: "golfer" | "golf_club" | "admin";
  iat?: number;
  exp?: number;
}

// register & login response
export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      isActive: boolean;
      isEmailVerified: boolean;
    };
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}

// jwt token response
export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}
