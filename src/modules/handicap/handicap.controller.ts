import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middlewares/async-handler.middleware';
import { HTTPSTATUS } from '@/config/http.config';
import { BadRequestException } from '@/utils/app-error.utils';

import { 
  ICalculateHandicapParams, 
  IHandicapOptions, 
  IHandicapCalculationResult 
} from './handicap.type';
import { handicapService } from './handicap.service';

export class HandicapController {
  /**
   * Submit a new score and update handicap
   * POST /handicap/scores
   */
  submitScore = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { 
      adjustedGrossScore, 
      courseRating, 
      slopeRating, 
      par, 
      pccAdjustment,
      options 
    } = req.body;

    if (!adjustedGrossScore || !courseRating || !slopeRating || !par) {
      throw new BadRequestException('Missing required fields: adjustedGrossScore, courseRating, slopeRating, par');
    }

    const params: ICalculateHandicapParams = {
      userId,
      adjustedGrossScore: Number(adjustedGrossScore),
      courseRating: Number(courseRating),
      slopeRating: Number(slopeRating),
      par: Number(par),
      pccAdjustment: pccAdjustment ? Number(pccAdjustment) : undefined,
      options: options as IHandicapOptions
    };

    const result = await handicapService.processScore(params);

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      data: result,
      message: 'Score submitted and handicap updated successfully'
    });
  });

  /**
   * Get current handicap information
   * GET /handicap/me
   */
  getMyHandicap = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const handicapInfo = await handicapService.getHandicap(userId);

    if (!handicapInfo) {
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: {
          handicapIndex: 54.0, // Default max handicap
          scoresCount: 0,
          message: 'No handicap data available. Submit scores to establish a handicap.'
        }
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: handicapInfo
    });
  });

  /**
   * Get handicap history
   * GET /handicap/history
   */
  getHandicapHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const history = await handicapService.getHandicapHistory(userId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: history || { scores: [] }
    });
  });
}

export const handicapController = new HandicapController();