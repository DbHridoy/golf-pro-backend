import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";

import { postService } from "./posts.service";

class PostsController {
  async createPost(req: Request, res: Response, _next: NextFunction) {
    const data = req.body;
    // logger.info(data, "Creating post");
    // const userId = req.user!.userId;
    const postData = {
      userId: req.user!.userId,
      ...data.body,
    };
    // logger.info(data)
    // logger.info(postData, "Creating post");
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
}

export const postController = new PostsController();
