import { z } from "zod";

import { objectIdGeneric } from "@/utils/zod-scham.utils";

export const UserRoleEnum = z.enum(["golfer", "golf_club", "system_admin"]);

export const userSchemaGeneric = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(4, "Password must be at least 4 characters"),
  // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

  role: UserRoleEnum,
  isActive: z.boolean().default(true).optional(),
  handicapIndex: z.number().min(0).max(54).optional(),
  isEmailVerified: z.boolean().default(false).optional(),
});

export const createUserSchema = z.object({
  body: userSchemaGeneric.omit({ isActive: true, isEmailVerified: true }),
});

export const updateUserSchema = z.object({
  body: userSchemaGeneric.partial().omit({ email: true, password: true, role: true }),
  params: z.object({
    id: objectIdGeneric,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  }),
  params: z.object({
    id: objectIdGeneric,
  }),
});

// get users schema
export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    role: UserRoleEnum.optional(),
    isActive: z.string().regex(/^(true|false)$/, "isActive must be true or false").optional(),
  }).optional(),
});

// get user shcema
export const getUserByIdSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});
