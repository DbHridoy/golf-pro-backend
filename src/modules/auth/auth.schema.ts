import { z } from "zod";

import { userSchemaGeneric } from "../user/user.schema";

export const authSchemaGeneric = z.object({
  email: userSchemaGeneric.shape.email,
  password: userSchemaGeneric.shape.password,
});

export const loginhSchema = z.object({
  body: authSchemaGeneric,
});

export const refreshAuthSchema = z.object({
  cookies: z.object({
    jwt: z.string(),
  }),
});
