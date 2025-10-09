import type { BaseDocument } from "@/utils/base-schema.utils";

export interface IGolferProfile extends BaseDocument {
  userId: string;
  fullName: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  dateOfBirth: Date;
  country: string;
  city: string;
  address: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  // Images
  profileImage?: string; // AWS S3 URL
  coverImage?: string; // AWS S3 URL

  // Golf-specific data
  ghinNumber?: string; // GHIN (Golf Handicap and Information Network)
  handicapIndex?: number; // Already in User model, but might be duplicated here for profile
  // Privacy settings
  isProfilePublic: boolean;

  // Social data (references to other collections)
  clubMemberships: string[]; // Array of Club._id
  friends: string[]; // Array of Golfer._id (self-referencing)
  friendRequests: string[]; // Array of FriendRequest._id
  clubMemberRequests: string[]; // Array of ClubMemberRequest._id
  notifications: string[]; // Array of Notification._id

  // Additional profile fields
  bio?: string;
  isActive?: boolean;
  // Activity tracking
  lastActiveAt?: Date;
  isOnline?: boolean;
}

// Location interface for Google Maps integration
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  placeId?: string; // Google Places ID
  formattedAddress?: string;
}

// Profile privacy settings
export interface ProfilePrivacySettings { 
  profileVisibility: "public" | "friends" | "private";
  showLocation: boolean;
  showHandicap: boolean;
  showClubMemberships: boolean;
  showFriends: boolean;
  allowFriendRequests: boolean;
}
