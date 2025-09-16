import type { z } from "zod";

import type {
  createGolferProfileSchema,
  getGolferProfileSchema,
  getGolferProfilesSchema,
  golferProfileSchemaGeneric,
  locationSchema,
  searchNearbyGolfersSchema,
  updateGolferProfileSchema,
  updateLocationSchema,
  uploadCoverImageSchema,
  uploadProfileImageSchema,
} from "./golfer-profile.schema";

// Base types
export type GolferProfileInput = z.infer<typeof golferProfileSchemaGeneric>;
export type LocationInput = z.infer<typeof locationSchema>;

// Request types
export type CreateGolferProfileRequest = z.infer<typeof createGolferProfileSchema>;
export type UpdateGolferProfileRequest = z.infer<typeof updateGolferProfileSchema>;
export type GetGolferProfileRequest = z.infer<typeof getGolferProfileSchema>;
export type GetGolferProfilesRequest = z.infer<typeof getGolferProfilesSchema>;
export type UploadProfileImageRequest = z.infer<typeof uploadProfileImageSchema>;
export type UploadCoverImageRequest = z.infer<typeof uploadCoverImageSchema>;
export type UpdateLocationRequest = z.infer<typeof updateLocationSchema>;
export type SearchNearbyGolfersRequest = z.infer<typeof searchNearbyGolfersSchema>;

// Response types


export interface GolferProfileListResponse {
  success: boolean;
  data: GolferProfileResponse["data"][];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// Search and filter types
export interface NearbyGolferSearch {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  page?: number;
  limit?: number;
}

export interface GolferProfileFilters {
  gender?: string;
  country?: string;
  city?: string;
  isProfilePublic?: boolean;
  minAge?: number;
  maxAge?: number;
  hasProfileImage?: boolean;
  search?: string;
}
