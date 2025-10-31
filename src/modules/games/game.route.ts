import { Router } from "express";

import gameController from "./game.controller";

const router = Router();
router.post("/calculate-stroke-play-game-score", gameController.calculateStrokePlayGameScore )
export default router;
