import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { friendController } from "./friends.controller";

const router = Router();

router.post("/add-friend", authMiddleware.authenticate, friendController.addFriend);
router.post("/accept-friend-request", authMiddleware.authenticate, friendController.acceptFriendRequest);
router.post("/reject-friend-request", authMiddleware.authenticate, friendController.rejectFriendRequest);
router.get("/get-my-friend-requests", authMiddleware.authenticate, friendController.getMyFriendRequests);
router.get("/get-my-sent-requests", authMiddleware.authenticate, friendController.getMySentRequest);

export default router;
