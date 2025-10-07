import { z } from "zod";

import { dateGeneric, emailGeneric, objectIdGeneric } from "@/utils/schema-generic.utils";

export const GenderEnum = z.enum(["male", "female", "other", "prefer_not_to_say"]);

// Location schema
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  placeId: z.string().optional(),
  formattedAddress: z.string().optional(),
});

// Base golfer profile schema

export const golferProfileSchemaGeneric = z.object({
  userId: objectIdGeneric,
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name cannot exceed 100 characters"),
  gender: GenderEnum,
  dateOfBirth: dateGeneric.refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 2 && age <= 120;
  }, {
    message: "Age must be between 2 and 120 years",
  }),

  // Location fields
  country: z.string().trim().min(1, "Country is required").max(100),
  city: z.string().trim().min(1, "City is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(200),
  // location: z.object({
  //   type: z.literal("Point").default("Point"),
  //   coordinates: z.tuple([z.number(), z.number()]),
  // }).optional(),

  // Images
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),

  // Golf-specific data
  ghinNumber: z.string().regex(/^\d{7}$/, "GHIN number must be 7 digits").optional(),
  handicapIndex: z.number().min(0).max(54).optional(),

  // Privacy
  isProfilePublic: z.boolean().default(true),

  // Additional fields
  // bio: z.string().trim().max(500, "Bio cannot exceed 500 characters").optional(),
});

// Create golfer profile schema
export const createGolferProfileSchema = z.object({
  body: golferProfileSchemaGeneric.omit({ userId: true }),
});

// Update golfer profile schema
export const updateGolferProfileSchema = z.object({
  body: golferProfileSchemaGeneric
    .partial()
    .omit({ userId: true })
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
  // params: z.object({
  //   id: objectIdGeneric,
  // }),
});

// Get golfer profile schema
export const getGolferProfileSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});

// Get golfer profiles with pagination schema
export const getGolferProfilesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sort: z.string().optional(),
    search: z.string().trim().min(1).optional(),
    gender: GenderEnum.optional(),
    country: z.string().trim().optional(),
    city: z.string().trim().optional(),
    isProfilePublic: z.enum(["true", "false"]).transform(val => val === "true").optional(),
    minAge: z.coerce.number().min(13).max(120).optional(),
    maxAge: z.coerce.number().min(13).max(120).optional(),
    hasProfileImage: z.enum(["true", "false"]).transform(val => val === "true").optional(),
    nearLocation: z.string().optional(), // "lat,lng,radius" format
  }).optional().refine((data) => {
    if (data?.minAge !== undefined && data?.maxAge !== undefined) {
      return data.minAge <= data.maxAge;
    }
    return true;
  }, {
    message: "Minimum age cannot be greater than maximum age",
    path: ["minAge"],
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

// Update location schema
export const updateLocationSchema = z.object({
  body: locationSchema,
  params: z.object({
    id: objectIdGeneric,
  }),
});

export const searchNearbyGolfersSchema = z.object({
  query: z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().min(1).max(1000).default(10), // km
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
  }),
});
