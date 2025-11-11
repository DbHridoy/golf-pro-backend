import type { Request, Response } from "express";

class GameController {
  // stroke play
  async calculateStrokePlayGameScore(req: Request, res: Response) {
    try {
      const { coursePar, strokes } = req.body;

      if (!coursePar || !Array.isArray(strokes) || strokes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Provide 'coursePar' and 'strokes' array.",
        });
      }

      // ✅ Step 1: Calculate totals
      const totalStrokes = strokes.reduce((sum, s) => sum + s, 0);
      const totalPar = Array.isArray(coursePar)
        ? coursePar.reduce((sum, p) => sum + p, 0)
        : coursePar;

      // ✅ Step 2: Compute difference
      const diff = totalStrokes - totalPar;

      // ✅ Step 3: Build result (official-style)
      let display, text;
      if (diff === 0) {
        display = "E";
        text = "Even Par";
      }
      else if (diff > 0) {
        display = `+${diff}`;
        text = `${diff} Over Par`;
      }
      else {
        display = `${diff}`; // negative number automatically shows “-”
        text = `${Math.abs(diff)} Under Par`;
      }

      // ✅ Step 4: Return result
      return res.status(200).json({
        success: true,
        data: {
          totalPar,
          totalStrokes,
          difference: diff,
          result: {
            display,
            text,
          },
        },
        message: "Stroke play score calculated successfully.",
      });
    }
    catch (error) {
      console.error("Error calculating score:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate score.",
      });
    }
  }
}

const gameController = new GameController();
export default gameController;
