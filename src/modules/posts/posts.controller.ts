import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { logger } from "@/middlewares/pino-logger";

import { postService } from "./posts.service";

class PostsController {
  async createPost(req: Request, res: Response, _next: NextFunction) {
    const data = req.body;
    logger.info(data, "Creating post");
    // const userId = req.user!.userId;
    const postData = {
      userId: req.user!.userId,
      ...data,
    };
    // logger.info(data)
    logger.info(postData, "post from controller");
    const post = await postService.createPost(postData);

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  };

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
