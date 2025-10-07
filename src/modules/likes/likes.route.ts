import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { likeController } from "./likes.controller";

const router = Router();

router.post("/create-like/:postId", authMiddleware.authenticate, likeController.makeLike);
router.patch("/toggle-like-status/:postId", authMiddleware.authenticate, likeController.toggleLikeStatus);
router.get("/get-all-likes/:postId", authMiddleware.authenticate, likeController.getAllLikesForPost);

export default router;
