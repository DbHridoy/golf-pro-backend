import { z } from "zod";

import { userSchemaGeneric } from "@/modules/user/user.schema";
import { emailGeneric } from "@/utils/schema-generic.utils";

export const authSchemaGeneric = userSchemaGeneric.pick({
  email: true,
  password: true,
});

export const loginSchema = z.object({
  body: authSchemaGeneric,
});

export const registerSchema = z.object({
  body: userSchemaGeneric.omit({
    isActive: true,
    isEmailVerified: true,
    handicapIndex: true,
  }),
});

export const refreshAuthSchema = z.object({
  cookies: z.object({
    jwt: z.string().min(1, "JWT token is required").refine((token) => {
      const parts = token.split(".");
      return parts.length === 3;
    }, {
      message: "Invalid JWT token format",
    }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailGeneric.trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(4, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

// Change email schema (for authenticated users)
export const changeEmailSchema = z.object({
  body: z.object({
    newEmail: emailGeneric.trim(),
    password: z.string().min(1, "Current password is required"),
  }),
});
