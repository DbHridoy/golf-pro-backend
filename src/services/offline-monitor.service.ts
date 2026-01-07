import GameParticipationModel from "@/modules/gameParticipation/game-participation.model";
import { sendFCMNotification } from "@/modules/notifications/fcm.service";
import ScorecardModel from "@/modules/scorecards/scorecard.model";
import UserModel from "@/modules/user/user.model";

/**
 * Check for players offline > 1 hour and invalidate their scorecards
 * Run this as a cron job every 5 minutes
 */
export async function checkOfflinePlayers() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find in-progress scorecards where player has been offline > 1 hour
    const offlineScorecards = await ScorecardModel.find({
      status: "in_progress",
      lastOnlineAt: { $lt: oneHourAgo },
      isPlayerOnline: true,
    }).populate("playerId");

    for (const scorecard of offlineScorecards) {
      // Mark scorecard as invalidated
      scorecard.status = "invalidated";
      scorecard.isPlayerOnline = false;
      await scorecard.save();

      // Update GameParticipation
      await GameParticipationModel.findByIdAndUpdate(
        scorecard.gameParticipationId,
        { status: "disqualified" },
      );

      // Notify player
      const user = await UserModel.findById(scorecard.playerId.userId);
      if (user?.fcmToken) {
        await sendFCMNotification([user.fcmToken], {
          title: "Round Invalidated",
          body: "Your scorecard was invalidated due to being offline for over 1 hour",
          data: {
            type: "round_invalidated",
            scorecardId: scorecard._id.toString(),
          },
        });
      }

      console.log(`Invalidated scorecard ${scorecard._id} for player ${scorecard.playerId.fullName}`);
    }

    return {
      invalidated: offlineScorecards.length,
      scorecardIds: offlineScorecards.map(s => s._id),
    };
  }
  catch (error) {
    console.error("Error checking offline players:", error);
    throw error;
  }
}
