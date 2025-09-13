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
