import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import { zParse } from "@/utils/validators.utils";

import type { CreatePostInput } from "./posts.type";

import { createPostSchema } from "./posts.schema";
import { postService } from "./posts.service";

class PostsController {
  createPost = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const body: CreatePostInput = await zParse(createPostSchema, req);
    logger.info(body, "body from controller");
    const userId = req.user!.userId;
    const postData = {
      userId,
      ...body,
    };
    logger.info(postData, "post data from controller");
    const post = await postService.createPost(postData);
    logger.info(post, "post from controller");
    res.status(HTTPSTATUS.OK).json(post);
  });
}

export const postController = new PostsController();
