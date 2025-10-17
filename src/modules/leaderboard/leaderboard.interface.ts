import { Document, Types } from 'mongoose';

export interface ILeaderboardEntry {
  position: number;
  golferId: Types.ObjectId;
  name: string;
  score?: number;
  thru?: number;
  totalStrokes?: number;
  isActive?: boolean;
  avatar?: string;
}

export interface IEventLeaderboard {
  eventId: Types.ObjectId;
  eventName: string;
  eventDate: Date;
  isCompleted: boolean;
  leaderboard: ILeaderboardEntry[];
  totalGolfers: number;
  lastUpdated: Date;
}

export interface ILeaderboardFilter {
  eventId?: string;
  golferId?: string;
  isCompleted?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}