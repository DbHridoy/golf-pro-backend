import { z } from "zod";

import {  objectIdGeneric } from "@/utils/schema-generic.utils";

export const GenderEnum = z.enum(["male", "female", "other", "prefer_not_to_say"]);

// Base post schema
export const postSchemaGeneric = z.object({
  userId: objectIdGeneric,
  postTitle: z.string().trim().min(1, "Post title is required").max(100, "Post title cannot exceed 100 characters"),
  postContent: z.string().trim().min(1, "Post content is required").max(1000, "Post content cannot exceed 1000 characters"),
  postImage: z.string().url().optional(),
  isPostPublic: z.boolean().default(true),
});

// Create post schema
export const createPostSchema = z.object({
  body: postSchemaGeneric,
});

// Update post schema
export const updatePostSchema = z.object({
  body: postSchemaGeneric
    .partial()
    .omit({ userId: true })
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
  params: z.object({
    id: objectIdGeneric,
  }),
});

// Get all post schema
export const getPostSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});


