import type { NextFunction, Request, Response } from "express";

import type { JWTPayload } from "@/modules/auth/auth.interface";

import { authService } from "@/modules/auth/auth.service";
import { UnauthorizedException } from "@/utils/app-error.utils";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// JWT Authentication Middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      throw new UnauthorizedException("Access token is required");
    }

    const payload = authService.verifyAccessToken(token);
    req.user = payload;

    next();
  }
  catch (error) {
    next(error);
  }
}

// Role-based authorization middleware

export function authorizeRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required.");
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedException("Insufficient permission.");
    }

    next();
  };
}
