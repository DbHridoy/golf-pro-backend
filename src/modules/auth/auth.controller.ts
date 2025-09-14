import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { zParse } from "@/utils/validators.utils";

import type { authService } from "./auth.service";
import type {
  ChangeEmailInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshAuthInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.type";

import {
  changeEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshAuthSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

export class AuthController {
  /**
   * Register new user
   * POST /auth/register
   */

  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { body }: RegisterInput = await zParse(registerSchema, req);

    const result = await authService.register(body);
  });
}
