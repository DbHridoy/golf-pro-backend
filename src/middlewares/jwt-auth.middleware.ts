import type { NextFunction, Request, Response } from "express";

import type { JWTPayload } from "@/modules/auth/auth.interface";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { authRepository } from "@/modules/auth/auth.repository.js";
import { authService } from "@/modules/auth/auth.service";
import { UnauthorizedException } from "@/utils/app-error.utils";

import { logger } from "./pino-logger.js";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// JWT Authentication Middleware

export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      const requestId = req.id || req.headers["x-request-id"] as string;

      if (!authHeader) {
        logger.warn({ requestId, ip: req.ip }, "No authorization header provided");
        throw new UnauthorizedException(
          "Access token required",
          ErrorCodeEnum.AUTH_TOKEN_NOT_FOUND,
        );
      }

      if (!authHeader.startsWith("Bearer ")) {
        logger.warn({ requestId, authHeader }, "Invalid authorization header format");
        throw new UnauthorizedException(
          "Invalid authorization header format",
          ErrorCodeEnum.AUTH_TOKEN_INVALID,
        );
      }

      const token = authHeader.substring(7);

      if (!token) {
        throw new UnauthorizedException(
          "Access token required",
          ErrorCodeEnum.AUTH_TOKEN_NOT_FOUND,
        );
      }

      const payload = authService.verifyAccessToken(token);

      const user = await authRepository.findUserById(payload.userId);

      if (!user) {
        logger.warn({ requestId, userId: payload.userId }, "User not found for valid token");
        throw new UnauthorizedException(
          "User not found",
          ErrorCodeEnum.AUTH_USER_NOT_FOUND,
        );
      }

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      logger.info({
        requestId,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      }, "User authenticated successfully");

      next();
    }
    catch (error) {
      logger.error({
        requestId: req.id,
        error: error instanceof Error ? error.message : "Unknown error",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      }, "Authentication failed");
      next(error);
    }
  }

  // Role-based authorization middleware

  authorize(allowedRoles: string | string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new UnauthorizedException(
            "User not authenticated",
            ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
          );
        }

        const userRole = req.user.role;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
          logger.warn({
            requestId: req.id,
            userId: req.user.userId,
            userRole,
            requiredRoles: roles,
          }, "Insufficient permissions");

          throw new UnauthorizedException(
            "Insufficient permissions",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED,
          );
        }

        logger.info({
          requestId: req.id,
          userId: req.user.userId,
          role: userRole,
          allowedRoles: roles,
        }, "Authorization successful");

        next();
      }
      catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user is accessing their own resource
   */
  authorizeSelf = (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException(
          "User not authenticated",
          ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
        );
      }

      const resourceUserId = req.params.id || req.params.userId;
      const currentUserId = req.user.userId;

      // System admin can access any resource
      if (req.user.role === "system_admin") {
        return next();
      }

      // Check if user is accessing their own resource
      if (resourceUserId !== currentUserId) {
        logger.warn({
          requestId: req.id,
          currentUserId,
          resourceUserId,
          role: req.user.role,
        }, "User attempting to access another user's resource");

        throw new UnauthorizedException(
          "You can only access your own resources",
          ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        );
      }

      next();
    }
    catch (error) {
      next(error);
    }
  };
}

export const authMiddleware = new AuthMiddleware();
