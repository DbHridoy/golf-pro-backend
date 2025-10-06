import { asyncHandler } from "@/middlewares/async-handler.middleware";

export class ClubProfileController {
  /**
   * Create golfer profile
   * POST /golfer-profiles
   */
  createProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: CreateGolferProfileRequest = await zParse(createGolferProfileSchema, req);
    // const {body}: CreateGolferProfileRequest = await createGolferProfileSchema.safeParseAsync(req.body);
    const userId = req.user!.userId; // From auth middleware

    const result = await golferProfileService.createProfile(userId, body);

    return res.status(HTTPSTATUS.CREATED).json(result);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: UpdateGolferProfileRequest = await zParse(updateGolferProfileSchema, req);
    console.error(body);
    const userId = req.user!.userId; // From auth middleware
    // Pass req.files to the service for file handling
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const result = await golferProfileService.updateProfile(userId, body, files);

    return res.status(HTTPSTATUS.OK).json(result);
  });
}

export const clubProfileController = new ClubProfileController();