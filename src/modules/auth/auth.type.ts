/* eslint-disable ts/consistent-type-definitions */
import type { z } from "zod";

import type { authSchemaGeneric, changeEmailSchema, forgotPasswordSchema, loginSchema, refreshAuthSchema, registerSchema, resetPasswordSchema, verifyEmailSchema } from "./auth.schema";

export type AuthInput = z.infer<typeof authSchemaGeneric>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshAuthInput = z.infer<typeof refreshAuthSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
  role: "golfer" | "golf_club" | "system_admin";
  iat?: number;
  exp?: number;
}

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

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}
