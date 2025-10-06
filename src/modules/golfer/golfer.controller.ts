import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import { zParse } from "@/utils/validators.utils";

import type {
  UpdateGolferProfileRequest,
} from "./golfer.type";

import GolferProfileModel from "./golfer.model";
import { golferProfileRepository } from "./golfer.repository";
import {
  updateGolferProfileSchema,
} from "./golfer.schema";
import { golferProfileService } from "./golfer.service";
// import { create } from "node:domain";

class GolferProfileController {
  // Update Profile
  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: UpdateGolferProfileRequest = await zParse(updateGolferProfileSchema, req);
    // logger.info(body, "Updating profile from controller");
    const userId = req.user!.userId; // From auth middleware

    // Pass req.files to the service for file handling
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const result = await golferProfileService.updateProfile(userId, body, files);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  getGolferProfiles = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    logger.info(req, "Getting profiles from controller");
    const result = await golferProfileService.getAllProfiles();
    return res.status(HTTPSTATUS.OK).json(result);
  });

  getSingleGolferProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params; // ← access the param
    const profile = await golferProfileRepository.findGolferById(id);
    return res.status(HTTPSTATUS.OK).json(profile);
  });
}

export const golferProfileController = new GolferProfileController();
