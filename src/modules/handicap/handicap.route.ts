import { Router } from "express";

import handicapController from "./handicap.controller";

const router = Router();

router.post("/calculate-handicap", handicapController.updatePlayerHandicap);

export default router;
