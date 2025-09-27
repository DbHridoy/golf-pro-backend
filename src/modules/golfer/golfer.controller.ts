import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { zParse } from "@/utils/validators.utils";

import type {
  CreateGolferProfileRequest,
  UpdateGolferProfileRequest,
} from "./golfer.type";

import {
  createGolferProfileSchema,
  updateGolferProfileSchema,
} from "./golfer.schema";
import { golferProfileService } from "./golfer.service";
// import { create } from "node:domain";

export class GolferProfileController {
  /**
   * Create golfer profile
   * POST /golfer-profiles
   */
  createProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: CreateGolferProfileRequest = await zParse(createGolferProfileSchema, req);
    // const {body}: CreateGolferProfileRequest = await createGolferProfileSchema.safeParseAsync(req.body);
    const userId = req.user!.userId; // From auth middleware

    const result = await golferProfileService.createProfile(userId, body);

    return res.status(HTTPSTATUS.CREATED).json(result);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: UpdateGolferProfileRequest = await zParse(updateGolferProfileSchema, req);
    const userId = req.user!.userId; // From auth middleware

    // Pass req.files to the service for file handling
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const result = await golferProfileService.updateProfile(userId, body, files);

    return res.status(HTTPSTATUS.OK).json(result);
  });
}

export const golferProfileController = new GolferProfileController();