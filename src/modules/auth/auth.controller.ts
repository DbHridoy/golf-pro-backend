import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { env } from "@/env";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import { authService } from "@/modules/auth/auth.service";
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export class AuthController {
  // Register
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body } = req;
    logger.info(`from authcontroller: ${JSON.stringify(body)}`);

    const result = await authService.register(body);

    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(HTTPSTATUS.CREATED).json({
      success: result.success,
      data: {
        user: result.data.user,
        accessToken: result.data.accessToken,
      },
      message: result.message,
    });
  });

  // reset password
  sendOtp = asyncHandler (async (req, res) => {
    const { email } = req.body; 
    const result = await authService.sendOtp(email);
    logger.info(result);
    res.status(HTTPSTATUS.OK).json(result);
  });

  verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const record = await authService.verifyOtp(email, otp);
    return res.status(HTTPSTATUS.OK).json(record);
  });

  setNewPassword = asyncHandler(async (req, res) => {
    const { email,newPassword, confirmPassword } = req.body;

    // Basic validation
    if (!newPassword || !confirmPassword) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Call service
    const result = await authService.setNewPassword(email, newPassword);

    return res.status(result.success ? HTTPSTATUS.OK : HTTPSTATUS.BAD_REQUEST).json(result);
  });

  // login
  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body } = req;
    // logger.info("from authcontroller");

    const result = await authService.login(body);
    // logger.info("from authcontroller");

    res.cookie("jwt", result.data.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: result.success,
      data: {
        user: result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      },
      message: result.message,
    });
  });

  // Endpoint: frontend sends the token here
  //  async googleLogin (req, res) => {
  //   const { credential } = req.body; // token from frontend (Google ID token)
  //   try {
  //     // Verify the token with Google
  //     const ticket = await client.verifyIdToken({
  //       idToken: credential,
  //       audience: process.env.GOOGLE_CLIENT_ID,
  //     });
  //     const payload = ticket.getPayload();

  //     // Extract useful info
  //     const { email, name, picture, sub: googleId } = payload;

  //     // TODO: find or create user in your DB
  //     let user = await authRepository.findOrCreateUser({ email, name, picture, googleId });

  //     // Create your own JWT
  //     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  //       expiresIn: "7d",
  //     });

  //     res.json({ token, user });
  //   } catch (err) {
  //     console.error("Google auth error:", err);
  //     res.status(401).json({ error: "Invalid Google token" });
  //   }
  // });

  // ghin login
  // ghinLogin = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   const { ghinNo, ghinPassword } = req.body;
  //   const result = await authService.ghinLogin({ ghinNo, ghinPassword });
  //   return res.status(HTTPSTATUS.OK).json(result);
  // });

  // generate refresh token
  // refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //   // const { cookies }: RefreshAuthInput = await zParse(refreshAuthSchema, req);
  //   const cookies = req.cookies;

  //   const result = await authService.refreshToken(cookies.jwt);

  //   res.cookie("jwt", result.data.refreshToken, {
  //     httpOnly: true,
  //     secure: env.NODE_ENV === "production",
  //     sameSite: "strict",
  //     maxAge: 7 * 24 * 60 * 60 * 1000,
  //   });

  //   return res.status(HTTPSTATUS.OK).json({
  //     success: result.success,
  //     data: {
  //       accessToken: result.data.accessToken,
  //     },
  //     message: result.message,
  //   });
  // });

  refreshToken = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      let refreshToken = req.cookies?.jwt;
      if (!refreshToken && req.headers.authorization?.startsWith("Bearer ")) {
        refreshToken = req.headers.authorization.split(" ")[1];
      }

      if (!refreshToken) {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          success: false,
          message: "Refresh token is required",
          errorCode: ErrorCodeEnum.AUTH_TOKEN_NOT_FOUND,
        });
      }

      const result = await authService.refreshToken(refreshToken);

      // Optionally update the cookie with new refresh token
      res.cookie("jwt", result.data.refreshToken, {
        httpOnly: true,
        // secure: env.NODE_ENV === "production",
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const responseData = {
        ...result,
        data: {
          accessToken: result.data.accessToken, // include only what you need
        },
      };

      res.status(HTTPSTATUS.OK).json(responseData);
    },
  );

  // logout
  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}

export const authController = new AuthController();
