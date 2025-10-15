import mongoose from "mongoose";

import { logger } from "@/middlewares/pino-logger";
import fileUploadUtils from "@/utils/file-upload.utils";

import { PostTagModel } from "../tags/tags.model";
import PostModel from "./posts.model";
import { postRepository } from "./posts.repository";

class PostServices {
  async createPost(
    userId: string,
    body: any,
    files: { [fieldname: string]: Express.Multer.File[] } = {},
  ) {
    const {
      postTitle,
      taggedFriends = [],
      taggedClubs = [],
      isPostPublic = true,
    } = body;

    // 1. upload files to S3 (if supplied)
    let postImage: string | undefined;
    let postVideo: string | undefined;

    if (files.postImage?.[0]) {
      const f = files.postImage[0];
      const key = `uploads/posts/${userId}/images/${Date.now()}-${f.originalname}`;
      postImage = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
    }

    if (files.postVideo?.[0]) {
      const f = files.postVideo[0];
      const key = `uploads/posts/${userId}/videos/${Date.now()}-${f.originalname}`;
      postVideo = await fileUploadUtils.uploadToS3(f.buffer, key, f.mimetype);
    }

    // 2. save post + tags atomically
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [postDoc] = await PostModel.create(
        [{
          userId,
          postTitle,
          postImage,
          postVideo,
          isPostPublic,
        }],
        { session },
      );

      const tags: any[] = [
        ...taggedFriends.map((id: string) => ({
          postId: postDoc._id,
          taggedEntityId: id,
          taggedEntityType: "GolferProfile",
          taggedBy: userId,
        })),
        ...taggedClubs.map((id: string) => ({
          postId: postDoc._id,
          taggedEntityId: id,
          taggedEntityType: "GolfClub",
          taggedBy: userId,
        })),
      ];

      if (tags.length)
        await PostTagModel.insertMany(tags, { session });

      await session.commitTransaction();
      return postDoc;
    }
    catch (err) {
      await session.abortTransaction();
      throw err;
    }
    finally {
      session.endSession();
    }
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
    if (!currentPost)
      return null;
    // logger.info(currentPost, "post from service");
    const currentPostActiveStatus = currentPost.isActive;
    const isActive = !currentPostActiveStatus;
    const post = await postRepository.togglePostStatus(postId, isActive);
    return post;
    // return currentPost;
  }
}

export const postService = new PostServices();
