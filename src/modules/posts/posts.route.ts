import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";

import { postController } from "./posts.controller";

const router = Router();

router.post(
  "/create-new-post",
  authMiddleware.authenticate,
  upload.fields([
    { name: "postImage", maxCount: 1 },
    { name: "postVideo", maxCount: 1 },
  ]),
  postController.createPost,
);
router.get("/get-all-posts", postController.getAllPosts);
router.get("/get-all-posts-of-user", authMiddleware.authenticate, postController.getAllPostsForUser);
router.patch("/toggle-post-status/:postId", authMiddleware.authenticate, postController.togglePostStatus);
router.patch("/toggle-like-status/:postId", authMiddleware.authenticate, postController.toggleLike);
router.get("/gell-all-comments/:postId", authMiddleware.authenticate, postController.getPostComments);
router.post("/make-comment/:postId", authMiddleware.authenticate, postController.postComment);
router.get("/:postId",postController.getSinglePost)
// router.get("/get-all-likes/:postId", authMiddleware.authenticate, postController.getAllLikesForPost);

export default router;
