import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";

import { clubRepository } from "../club/club.repository";
import { golferRepository } from "../golfer/golfer.repository";
import { postService } from "./posts.service";

class PostsController {
  async createPost(req: Request, res: Response, _next: NextFunction) {
    const { body } = req;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const userId=req.user?.userId
  

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

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;
    const userId = req.user?.userId;
    const likStatus = await postService.toggleLike(postId, userId);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Like toggled successfully",
      data: likStatus,
    });
  }

  async postComment(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.userId;
    const postId = req.params.postId;
    const commentText = req.body.comment;
    const comment = postService.addComment(postId, userId, commentText);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  }

  async getPostComments(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;
    const comments = postService.getPostComments(postId);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
    });
  }

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
