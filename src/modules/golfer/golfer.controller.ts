import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";

import { golferService } from "./golfer.service";

class GolferController {
  // Get My Profile
  getMyProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user!.userId; // From auth middleware
      const profile = await golferService.getMyProfile(userId);
      return res.status(HTTPSTATUS.OK).json(profile);
    }
  );
  getSingleGolfer = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { body } = req;
      const userId = req.user!.userId; // From auth middleware

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const result = await golferService.updateProfile(userId, body, files);

      return res.status(HTTPSTATUS.OK).json(result);
    }
  );
  // Update Profile
  updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { body } = req;
      const userId = req.user!.userId; // From auth middleware

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const result = await golferService.updateProfile(userId, body, files);

      return res.status(HTTPSTATUS.OK).json(result);
    }
  );
  reportProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { body } = req;

      const userId = req.user!.userId; // From auth middleware

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const result = await golferService.updateProfile(userId, body, files);

      return res.status(HTTPSTATUS.OK).json(result);
    }
  );
}

export const golferController = new GolferController();
