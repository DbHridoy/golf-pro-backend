import type { NextFunction, Request, Response } from "express";

import { logger } from "@/middlewares/pino-logger";

import { commentService } from "./comments.service";

class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction) {
    logger.info(req.body, "data from controller");
    const body  = req.body;
    const authorId = req.user!.userId;
    const data = { authorId, ...body };
    logger.info(data, "data from controller");
    const result = await commentService.createNewComment(data);
    res.status(200).json(result);
  }

  async getAllCommentsForPost(req: Request, res: Response, next: NextFunction) {
    const result = await commentService.getAllCommentsForPost(req.params.postId!);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export const commnetController = new CommentController();
