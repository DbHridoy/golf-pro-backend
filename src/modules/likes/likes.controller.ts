import type { NextFunction, Request, Response } from "express";

import { likeService } from "./likes.service";

class LikeController {
  async makeLike(req: Request, res: Response, _next: NextFunction) {

    const postId = req.params.postId;
    const userId = req.user!.userId;

    const finalData = {
      postId,
      userId,
    };

    const result = await likeService.makeLike(finalData);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async toggleLikeStatus(req: Request, res: Response, _next: NextFunction) {
    const postId=req.params.postId
    const userId = req.user!.userId;
    const finalData = {
      postId,
      userId,
    };
    const result = await likeService.toggleLikeStatus(finalData);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async getAllLikesForPost(req: Request, res: Response, next: NextFunction) {
    const result = await likeService.getAllLikesForPost(req.params.postId!);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
}
export const likeController = new LikeController();
