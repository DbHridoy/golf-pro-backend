import type { CreatePostInput } from "./posts.type";

import PostModel from "./posts.model";

class PostServices {
  async createPost(post: CreatePostInput) {
    const newpost = new PostModel(post);
    return await newpost.save();
  }
}

export const postService = new PostServices();
