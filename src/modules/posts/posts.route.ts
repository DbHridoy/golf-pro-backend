import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { postController } from "./posts.controller";

const router = Router();

router.post("/create-new-post", authMiddleware.authenticate, postController.createPost);

export default router;
