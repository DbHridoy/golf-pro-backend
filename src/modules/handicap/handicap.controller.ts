import handicapService from "./handicap.service";

class HandicapController {
  // controllers/handicapController.js
  updatePlayerHandicap = async (playerId: string) => {
    const rounds = await Round.find({ playerId })
      .sort({ date: -1 })
      .limit(20);

    if (rounds.length < 3) {
      return {
        status: "pending",
        handicapIndex: null,
        message: "Play at least 3 rounds to establish your handicap.",
      };
    }

    // Calculate new handicap
    const handicap = handicapService.calculateHandicap(rounds);

    if (!handicap) {
      return {
        status: "pending",
        handicapIndex: null,
        message: "Play at least 3 valid rounds to establish your handicap.",
      };
    }

    await Player.findByIdAndUpdate(playerId, {
      handicapIndex: handicap,
      lastHandicapUpdate: new Date(),
    });

    return {
      status: "updated",
      handicapIndex: handicap,
      message: "Handicap successfully updated based on recent rounds.",
    };
  };
}

const handicapController = new HandicapController();

export default handicapController;
