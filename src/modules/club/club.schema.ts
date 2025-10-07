import { z } from "zod";

import { dateGeneric, objectIdGeneric } from "@/utils/schema-generic.utils";

// Base golfer profile schema

export const clubProfileSchemaGeneric = z.object({
  userId: objectIdGeneric,
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  clubName: z.string().trim().min(1, "Club name is required").max(100, "Club name cannot exceed 100 characters"),
  // Location fields
  country: z.string().trim().min(1, "Country is required").max(100),
  city: z.string().trim().min(1, "City is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(200),
  // Images
  clubprofileImage: z.string().url().optional(),
  clubcoverImage: z.string().url().optional(),
  // Golf-specific data
  ghinNumber: z.string().regex(/^\d{7}$/, "GHIN number must be 7 digits").optional(),
  handicapIndex: z.number().min(0).max(54).optional(),
  // Privacy
  isProfilePublic: z.boolean().default(true),
});

// Create golfer profile schema
export const createClubProfileSchema = z.object({
  body: clubProfileSchemaGeneric.omit({ userId: true }),
});

// Update golfer profile schema
export const updateclubProfileSchema = z.object({
  body: clubProfileSchemaGeneric
    .partial()
    .omit({ userId: true })
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

// Get golfer profile schema
export const getClubProfileSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});

// Get golfer profiles with pagination schema
export const getClubProfilesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sort: z.string().optional(),
    search: z.string().trim().min(1).optional(),
    country: z.string().trim().optional(),
    city: z.string().trim().optional(),
    isProfilePublic: z.enum(["true", "false"]).transform(val => val === "true").optional(),
    hasProfileImage: z.enum(["true", "false"]).transform(val => val === "true").optional(),
  }),
});

// Upload profile image schema
export const uploadProfileImageSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});

// Upload cover image schema
export const uploadCoverImageSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});
