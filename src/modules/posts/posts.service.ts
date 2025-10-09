import { logger } from "@/middlewares/pino-logger";

import PostModel from "./posts.model";
import { postRepository } from "./posts.repository";

class PostServices {
  async createPost(post) {
    // logger.info(post, "post from service");
    const newpost = new PostModel(post);
    // logger.info(newpost, "post from service");
    return newpost.save();
  }

  async getAllPosts() {
    const posts = await postRepository.getAllPosts();
    return posts;
  }

  async getAllPostsForUser(userId) {
    const posts = await postRepository.getAllPostsForUser(userId);
    return posts;
  }

  async togglePostStatus(postId) {
    const currentPost = await postRepository.getSinglePost(postId);
    if(!currentPost) return null;
    // logger.info(currentPost, "post from service");
    const currentPostActiveStatus = currentPost.isActive;
    const isActive = !currentPostActiveStatus;
    const post = await postRepository.togglePostStatus(postId, isActive);
    return post;
    // return currentPost;
  }
}

export const postService = new PostServices();
