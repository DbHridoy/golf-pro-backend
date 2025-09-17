import { z } from "zod";

import { userSchemaGeneric } from "@/modules/user/user.schema";

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
