import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { postController } from "./posts.controller";

const router = Router();

router.post("/create-new-post", authMiddleware.authenticate, postController.createPost);
router.get("/get-all-posts", authMiddleware.authenticate, postController.getAllPosts);
router.get("/get-all-posts-of-user", authMiddleware.authenticate, postController.getAllPostsForUser);

export default router;
