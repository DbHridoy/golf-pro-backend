import type { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import type { Event } from "../events/events.model";
import type { IEventLeaderboard, ILeaderboardEntry, ILeaderboardFilter } from "./leaderboard.interface";

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel("Event") private readonly eventModel: Model<Event>,
  ) {}

  async getEventLeaderboard(eventId: string): Promise<IEventLeaderboard> {
    const event = await this.eventModel
      .findById(eventId)
      .populate("members", "name avatar")
      .lean();

    if (!event) {
      throw new Error("Event not found");
    }

    // Sort members by score (if available) or randomly for demo
    const sortedEntries: ILeaderboardEntry[] = event.members
      .map((member, index) => ({
        position: index + 1,
        golferId: member._id,
        name: member.name,
        score: Math.floor(Math.random() * 20) - 5, // Random score for demo
        thru: 18, // Assuming completed round
        isActive: true,
        avatar: member.avatar,
      }))
      .sort((a, b) => a.score - b.score) // Lower score is better in golf
      .map((entry, index) => ({
        ...entry,
        position: index + 1, // Recalculate positions after sorting
      }));

    return {
      eventId: event._id,
      eventName: event.name || "Golf Event",
      eventDate: event.startDate || new Date(),
      isCompleted: event.endDate ? event.endDate < new Date() : false,
      leaderboard: sortedEntries,
      totalGolfers: sortedEntries.length,
      lastUpdated: new Date(),
    };
  }

  async getGolferEvents(golferId: string, isCompleted: boolean): Promise<IEventLeaderboard[]> {
    const now = new Date();
    const query: any = {
      members: golferId,
    };

    if (isCompleted) {
      query.endDate = { $lt: now };
    }
    else {
      query.startDate = { $gt: now };
    }

    const events = await this.eventModel
      .find(query)
      .sort({ startDate: isCompleted ? -1 : 1 })
      .limit(10)
      .lean();

    return Promise.all(
      events.map(event => this.getEventLeaderboard(event._id.toString())),
    );
  }

  async getLeaderboards(filters: ILeaderboardFilter): Promise<IEventLeaderboard | IEventLeaderboard[]> {
    if (filters.eventId) {
      return this.getEventLeaderboard(filters.eventId);
    }

    if (filters.golferId) {
      return this.getGolferEvents(
        filters.golferId,
        filters.isCompleted || false,
      );
    }

    throw new Error("Either eventId or golferId must be provided");
  }
}
