import { z } from "zod";

import { objectIdGeneric } from "@/utils/schema-generic.utils";

// Base post schema
export const postSchemaGeneric = z.object({
  userId: objectIdGeneric,
  postTitle: z.string().trim().max(200, "Post title cannot exceed 200 characters").transform(val => (val === "" ? undefined : val)).optional(),
  postImage: z.string().url().optional(),
  taggedFriends: z.array(objectIdGeneric).optional(),
  taggedClubs: z.array(objectIdGeneric).optional(),
  comments: z.array(objectIdGeneric).optional(),
  likes: z.array(objectIdGeneric).optional(),
  likesCount: z.number().min(0).default(0),
  commentsCount: z.number().min(0).default(0),
  isPostPublic: z.boolean().default(true),
});

// Create post schema
export const createPostSchema = z.object({
  body: postSchemaGeneric
  .partial()
  .omit({ userId: true })
  .refine(data => data.postTitle || data.postImage, {
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
});
