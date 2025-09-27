import { Router } from "express";

import { notificationController } from "./notification.controller";

const router = Router();

router.post("/", notificationController.sendPushNotification);

export default router;