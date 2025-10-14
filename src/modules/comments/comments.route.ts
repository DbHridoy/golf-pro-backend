import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { commnetController } from "./comments.controller";

const router = Router();

router.post("/create-comment", authMiddleware.authenticate, commnetController.createComment);
router.get("/get-all-comments/:postId", authMiddleware.authenticate, commnetController.getAllCommentsForPost);

export default router;
