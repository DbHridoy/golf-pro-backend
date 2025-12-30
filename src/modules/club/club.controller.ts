import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";

import { clubRepository } from "./club.repository";
import { clubService } from "./club.service";

export class ClubController {
  getClubProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId; // From auth middleware
    const profile = await clubService.getClubProfile(userId);
    return res.status(HTTPSTATUS.OK).json(profile);
  });

  // createProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   const { body } = req;
  //   const userId = req.user!.userId; // From auth middleware

  //   const result = await clubService.createProfile(userId, body);

  //   return res.status(HTTPSTATUS.CREATED).json(result);
  // });

  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body } = req;
    // logger.info(body, "Updating profile from controller");
    const userId = req.user!.userId; // From auth middleware

    // Pass req.files to the service for file handling
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const result = await clubService.updateProfile(userId, body, files);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  getAllClubs = asyncHandler(async (req, res) => {
    const allClubs = await clubRepository.getAllClubs();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All clubs fetched successfully",
      data: allClubs,
    });
  });
}

export const clubController = new ClubController();
