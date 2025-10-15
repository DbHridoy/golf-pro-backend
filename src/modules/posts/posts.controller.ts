import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { logger } from "@/middlewares/pino-logger";

import { postService } from "./posts.service";

class PostsController {
 async createPost(req: Request, res: Response, _next: NextFunction) {
  const { body } = req;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const userId = req.user!.userId;

  const post = await postService.createPost(userId, body, files);

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
}

  async getAllPosts(req: Request, res: Response, _next: NextFunction) {
    const posts = await postService.getAllPosts();
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
    });
  };

  async getAllPostsForUser(req: Request, res: Response, _next: NextFunction) {
    const userId = req.user!.userId;
    const posts = await postService.getAllPostsForUser(userId);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
    });
  };

  async togglePostStatus(req: Request, res: Response, _next: NextFunction) {
    const postId = req.params.postId;
    const post = await postService.togglePostStatus(postId);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Post status toggled successfully",
      data: post,
    });
  };
}

export const postController = new PostsController();
