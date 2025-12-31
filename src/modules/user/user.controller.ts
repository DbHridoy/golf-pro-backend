import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";

import { userService } from "./user.service";

export class UserController {
  // toggleActiveStatus = asyncHandler(async (req, res) => {
  toggleActiveStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params; // ✅ Destructure properly
    // logger.info(`reportId from usercontroller: ${reportId}`);

    const toggledUser = await userService.toggleActiveStatus(userId);

    res.status(200).json({
      success: true,
      message: "User status toggled successfully",
      data: toggledUser,
    });
  });

  createClub=asyncHandler(async(req,res)=>{
    const {fullName,email,password}=req.body
    const club=await userService.createClub(fullName,email,password)
    res.status(200).send({
      success:true,
      message:"Club created successfully",
      data:club
    })
    
  })

  getUsers = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { query } = req;
      const result = await userService.getUsers(query);

      return res.status(HTTPSTATUS.OK).json(result);
    },
  );

  getUserById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { params } = req;

      const result = await userService.getUserById(params.id);

      return res.status(HTTPSTATUS.OK).json(result);
    },
  );

  getAllClubs = asyncHandler(async (req, res) => {
    const clubs = await userService.getAllClubs();
    res.status(200).send({
      success: true,
      message: "All clubs fetched successfully",
      data: clubs,
    });
  });
  getAllGolfers=asyncHandler(async(req,res)=>{
    const golfers=await userService.getAllGolfers()
    res.status(200).send({
      success:true,
      message:"All golfers fetched successfully",
      data:golfers
    })
  })

  updateUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { params, body } = req;

      const result = await userService.updateUser(params.id, body);

      return res.status(HTTPSTATUS.OK).json(result);
    },
  );

  changePassword = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { params, body } = req;

      const result = await userService.changePassword(params.id, body);

      return res.status(HTTPSTATUS.OK).json(result);
    },
  );

  /**
   * Forgot password
   * POST /user/forgot-password
   */
  // sendOtp = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   const { body } = req;
  //   // logger.info(body);
  //   // TODO: Implement forgot password logic with email sending
  //   // For now, return success message
  //   return res.status(HTTPSTATUS.OK).json({
  //     success: true,
  //     message: "Password reset instructions sent to your email",
  //   });
  // });

  /**
   * Reset password
   * POST /user/reset-password
   */
  // resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   const { body } = req;
  //   // logger.info(body);
  //   // TODO: Implement reset password logic
  //   // For now, return success message
  //   return res.status(HTTPSTATUS.OK).json({
  //     success: true,
  //     message: "Password reset successfully",
  //   });
  // });

  /**
   * Verify email
   * POST /user/verify-email
   */
  // verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   const { body } = req;
  //   // logger.info(body);
  //   // TODO: Implement email verification logic
  //   // For now, return success message
  //   return res.status(HTTPSTATUS.OK).json({
  //     success: true,
  //     message: "Email verified successfully",
  //   });
  // });

  /**
   * Change email for authenticated user
   * POST /user/change-email
   */
  changeEmail = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { body } = req;
      // logger.info(body);
      // TODO: Implement change email logic
      // For now, return success message
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Email change request sent. Please verify your new email.",
      });
    },
  );

  async getUserMedia(req: Request, res: Response) {
    const userId = req.user!.userId; // or from params if admin endpoint
    const media = await userService.getUserMedia(userId);
    res.json({
      success: true,
      data: media,
    });
  }
}

export const userController = new UserController();
