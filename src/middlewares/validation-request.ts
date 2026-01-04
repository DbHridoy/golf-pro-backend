import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

import catchAsync from "../utility/catchAsync.js";

function validationRequest(schema: AnyZodObject) {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // validation checking
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });
    next();
  });
}

export default validationRequest;
