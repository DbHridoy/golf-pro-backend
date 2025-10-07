import type { BaseDocument } from "@/utils/base-schema.utils";

export interface IAdminProfile extends BaseDocument {
  userId: string;
  fullName: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  dateOfBirth: Date;
  
  // Images
  profileImage?: string; // AWS S3 URL

  notifications: string[]; // Array of Notification._id

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
