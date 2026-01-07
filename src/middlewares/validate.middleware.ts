import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { logger } from "./pino-logger.js";

export function validate(schema: ZodType<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(req.file, "File from validate middleware");
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error); // ✅
    }

    req.body = result.data;
    next();
  };
}
