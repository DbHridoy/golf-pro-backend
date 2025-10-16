import { Router } from "express";

import { notificationController } from "./notification.controller";

const router = Router();

router.post("/", notificationController.sendPushNotification);
router.get("/", notificationController.getUserNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
