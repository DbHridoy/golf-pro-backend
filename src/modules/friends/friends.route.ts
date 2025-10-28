import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { friendController } from "./friends.controller";

const router = Router();

router.post("/send-friend-request", authMiddleware.authenticate, friendController.sendFriendRequest);
router.post("/accept-friend-request", authMiddleware.authenticate, friendController.acceptFriendRequest);
router.post("/reject-friend-request", authMiddleware.authenticate, friendController.rejectFriendRequest);
router.get("/get-my-requests", authMiddleware.authenticate, friendController.getMyRequests);
router.get("/get-my-sent-requests", authMiddleware.authenticate, friendController.getMySentRequest);
router.get("/get-my-friends", authMiddleware.authenticate, friendController.getMyFriends);
router.get("/get-all-friendship",friendController.getAllFriendships);

export default router;
