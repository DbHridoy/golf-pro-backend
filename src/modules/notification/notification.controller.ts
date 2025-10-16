import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { logger } from "@/middlewares/pino-logger";
import admin from "@/modules/notification/notification.config.js";
import { notificationService } from "./notification.service";

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
      res.status(500).json({ success: false, error });
    }
  });

  getUserNotifications = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    const { page, limit, unreadOnly } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      unreadOnly: unreadOnly === 'true',
    });
    
    res.json({ success: true, data: notifications });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const notification = await notificationService.markAsRead(id, userId);
    res.json({ success: true, data: notification });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await notificationService.deleteNotification(id, userId);
    res.json({ success: true, message: "Notification deleted" });
  });
}

export const notificationController = new NotificationController();