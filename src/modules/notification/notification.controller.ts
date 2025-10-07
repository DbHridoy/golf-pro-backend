import type { NextFunction, Request, Response } from "express";

import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { logger } from "@/middlewares/pino-logger";
import admin from "@/modules/notification/notification.config.js";

export class NotificationController {
  sendPushNotification = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { token, title, body } = req.body;

    const message = {
      notification: { title, body },
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      res.json({ success: true, response });
    }
    catch (error) {
      // logger.error(error, "Error sending push notification");
      res.status(500).json({ success: false, error });
    }
  });
}

export const notificationController = new NotificationController();
