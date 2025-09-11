import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { ZodError } from "zod";

import { HTTPSTATUS } from "@/config/http.config";
import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { AppError } from "@/utils/app-error.utils";
import {env} from "@/env"

import { logger } from "./pino-logger.js";

function formatZodError(res: Response, error: z.ZodError, requestId?: string) {
  const errors = error?.issues?.map(err => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    requestId,
    timestamp: new Date().toISOString(),
  });
}

// MongoDB error handler
function handleMongoDBError(error: any, requestId?: string) {
  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return {
      statusCode: HTTPSTATUS.BAD_REQUEST,
      message: "Database validation failed",
      errors,
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
      requestId,
    };
  }

  // MongoDB CastError (Invalid ObjectId)
  if (error.name === "CastError") {
    return {
      statusCode: HTTPSTATUS.BAD_REQUEST,
      message: `Invalid ${error.path}: ${error.value}`,
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
      requestId,
    };
  }

  // MongoDB Duplicate Key Error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      statusCode: HTTPSTATUS.CONFLICT,
      message: `${field} already exists`,
      errorCode: ErrorCodeEnum.RESOURCE_CONFLICT,
      requestId,
    };
  }

  // MongoDB Connection Error
  if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
    return {
      statusCode: HTTPSTATUS.SERVICE_UNAVAILABLE,
      message: "Database connection error",
      errorCode: ErrorCodeEnum.DATABASE_CONNECTION_ERROR,
      requestId,
    };
  }

  return null;
}

export const errorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  _: NextFunction,
): any => {
  const requestId = req.id || req.headers["x-request-id"] as string;

  logger.error({
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress,
    error: {
      name: error.name,
      message: error.message,
      stack: env.NODE_ENV === "development" ? error.stack : undefined,
    },
  });

  console.error(`Error Occured on PATH: ${req.path} `, error);

  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid JSON format. Please check your request body.",
    });
  }

  if (error instanceof ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknow error occurred",
  });
};
