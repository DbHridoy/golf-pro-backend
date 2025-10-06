import type { BaseDocument } from "@/utils/base-schema.utils";

export interface IClubProfile extends BaseDocument {
  userId: string;
  clubName: string;

  country: string;
  city: string;
  address: string;

  profileImage?: string; // AWS S3 URL
  coverImage?: string; // AWS S3 URL

  // Golf-specific data
  ghinNumber?: string; // GHIN (Golf Handicap and Information Network)
  handicapIndex?: number; // Already in User model, but might be duplicated here for profile
  // Privacy settings
  isProfilePublic: boolean;

  // Social data (references to other collections)
  clubMembers: string[]; // Array of Club._id

  clubMemberRequests: string[]; // Array of ClubMemberRequest._id
  notifications: string[]; // Array of Notification._id

  // Additional profile fields
  bio?: string;

  // Activity tracking
  lastActiveAt?: Date;
  isOnline?: boolean;
}
