import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { zParse } from "@/utils/validators.utils";

import type {
  CreateGolferProfileRequest,
  GetGolferProfileRequest,
  GetGolferProfilesRequest,
  SearchNearbyGolfersRequest,
  UpdateGolferProfileRequest,
  UpdateLocationRequest,
  UploadCoverImageRequest,
  UploadProfileImageRequest,
} from "./golfer.type";

import {
  createGolferProfileSchema,
  getGolferProfileSchema,
  getGolferProfilesSchema,
  searchNearbyGolfersSchema,
  updateGolferProfileSchema,
  updateLocationSchema,
  uploadCoverImageSchema,
  uploadProfileImageSchema,
} from "./golfer.schema";
import { golferProfileService } from "./golfer.service";

export class GolferProfileController {
  /**
   * Create golfer profile
   * POST /golfer-profiles
   */

  createProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: CreateGolferProfileRequest = await zParse(createGolferProfileSchema, req);
    const userId = req.user!.userId; // From auth middleware

    const result = await golferProfileService.createProfile(userId, body);

    return res.status(HTTPSTATUS.CREATED).json(result);
  });
}

export const golferProfileController = new GolferProfileController();
