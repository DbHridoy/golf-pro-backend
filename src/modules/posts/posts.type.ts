import type z from "zod";

import type { createPostSchema } from "./posts.schema";

export type CreatePostInput = z.infer<typeof createPostSchema>;
