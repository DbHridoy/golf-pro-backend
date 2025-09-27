import type { z } from "zod";

import type { authSchemaGeneric, loginSchema, refreshAuthSchema, registerSchema } from "@/modules/auth/auth.schema";

export type AuthInput = z.infer<typeof authSchemaGeneric>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshAuthInput = z.infer<typeof refreshAuthSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
