import { z } from "zod";

import { objectIdGeneric } from "@/utils/schema-generic.utils";

// Base post schema
export const postSchemaGeneric = z.object({
  userId: objectIdGeneric,
  postTitle: z.string().trim().max(200, "Post title cannot exceed 200 characters").transform(val => (val === "" ? undefined : val)).optional(),
  postImage: z.string().url().optional(),
  taggedFriends: z.array(objectIdGeneric).optional(),
  taggedClub: objectIdGeneric,
  isPostPublic: z.boolean().default(true),
});

// Create post schema
export const createPostSchema = z.object({
  body: postSchemaGeneric.refine(data => data.postTitle || data.postImage, {
    message: "You must provide at least a title or an image",
    path: ["postTitle"], // optional: highlights the title field
  }),
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
