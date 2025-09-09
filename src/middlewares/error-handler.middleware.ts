import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { ZodError } from "zod";

import { HTTPSTATUS } from "@/config/http.config";
import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { AppError } from "@/utils/app-error";

function formatZodError(res: Response, error: z.ZodError) {
  const errors = error?.issues?.map(err => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
}

export const errorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  _: NextFunction,
): any => {
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
