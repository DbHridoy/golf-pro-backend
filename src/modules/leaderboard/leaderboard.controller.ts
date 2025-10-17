import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";

import type { User } from "../user/user.model";
import type { ILeaderboardFilter } from "./leaderboard.interface";
import type { LeaderboardService } from "./leaderboard.service";

import { CurrentUser } from "../../decorators/current-user.decorator";
import { AuthGuard } from "../../middlewares/guards/auth.guard";

@Controller("leaderboard")
@UseGuards(AuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query("eventId") eventId?: string,
    @Query("isCompleted") isCompleted?: boolean,
    @CurrentUser() currentUser?: User,
  ) {
    const filters: ILeaderboardFilter = {
      eventId,
      golferId: currentUser?._id.toString(),
      isCompleted: isCompleted !== undefined ? isCompleted === true : undefined,
    };

    return this.leaderboardService.getLeaderboards(filters);
  }

  @Get("upcoming")
  async getUpcomingEvents(@CurrentUser() currentUser: User) {
    return this.leaderboardService.getGolferEvents(currentUser._id.toString(), false);
  }

  @Get("completed")
  async getCompletedEvents(@CurrentUser() currentUser: User) {
    return this.leaderboardService.getGolferEvents(currentUser._id.toString(), true);
  }

  @Get("event/:eventId")
  async getEventLeaderboard(@Param("eventId") eventId: string) {
    return this.leaderboardService.getEventLeaderboard(eventId);
  }
}
