import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import { zParse } from "@/utils/validators.utils";

import type {
  UpdateGolferProfileRequest,
} from "./golfer.type";

import {
  updateGolferProfileSchema,
} from "./golfer.schema";
import { golferService } from "./golfer.service";
// import { create } from "node:domain";

class GolferController {
  // Get My Profile
  getMyProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId; // From auth middleware
    const profile = await golferService.getMyProfile(userId);
    return res.status(HTTPSTATUS.OK).json(profile);
  });

  // Update Profile
  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: UpdateGolferProfileRequest = await zParse(updateGolferProfileSchema, req);
    // logger.info(body, "Updating profile from controller");
    const userId = req.user!.userId; // From auth middleware

    // Pass req.files to the service for file handling
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const result = await golferService.updateProfile(userId, body, files);

    return res.status(HTTPSTATUS.OK).json(result);
  });
}

export const golferController = new GolferController();
