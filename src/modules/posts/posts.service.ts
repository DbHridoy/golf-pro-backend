import mongoose, { Types } from "mongoose";

import { logger } from "@/middlewares/pino-logger";
import fileUploadUtils from "@/utils/file-upload.utils";

import { notificationService } from "../notification/notification.service";
import { PostTagModel } from "../tags/tags.model";
import UserModel from "../user/user.model";
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
          taggedEntityType: "Golfer",
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
      try {
        for (const friendId of taggedFriends) {
          await notificationService.createAndSendNotification({
            recipientId: friendId,
            type: "post_created",
            title: "New Post",
            body: `You were tagged in a post${postTitle ? `: ${postTitle}` : ""}`,
            payload: {
              postId: postDoc._id.toString(),
              postTitle: postTitle || "",
            },
          });
        }
      }
      catch (error) {
        logger.error("Failed to send post tagging notifications:", error);
      }

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

  async toggleLike(postId: string, userId: string) {
    const postObjectId = new Types.ObjectId(postId);
    const userObjectId = new Types.ObjectId(userId);

    // 1️⃣ Check if the user already liked the post
    const post = await PostModel.findOne({
      "_id": postObjectId,
      "likedBy.userId": userObjectId,
    });

    if (post) {
    // 🔹 User already liked → remove like
      await PostModel.updateOne(
        { _id: postObjectId },
        {
          $pull: { likedBy: { userId: userObjectId } },
          $inc: { likes: -1 },
        },
      );
      return { liked: false };
    }
    else {
    // 🔹 User hasn't liked yet → add like
      await PostModel.updateOne(
        { _id: postObjectId },
        {
          $push: { likedBy: { userId: userObjectId, isLike: true } },
          $inc: { likes: 1 },
        },
      );
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, comment: string) {
    if (!comment || comment.trim().length === 0) {
      throw new Error("Comment cannot be empty");
    }

    const postObjectId = new mongoose.Types.ObjectId(postId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 🔹 Fetch user to store snapshot
    const user = await UserModel.findById(userObjectId).select("fullName");
    if (!user)
      throw new Error("User not found");

    const commentData = {
      userId: userObjectId,
      fullName: user.fullName, // snapshot on creation
      comment,
      createdAt: new Date(),
    };

    // 🔹 Insert comment
    const updatedPost = await PostModel.findByIdAndUpdate(
      postObjectId,
      {
        $push: { comments: commentData },
      },
      { new: true },
    )
      .populate([
        { path: "userId", select: "fullName email profileImage" },
        { path: "comments.userId", select: "fullName profileImage" },
        { path: "likedBy.userId", select: "fullName profileImage" },
        { path: "taggedFriends.userId", select: "fullName profileImage" },
        { path: "taggedClubs.clubId", select: "name logo" },
      ])
      .lean({ virtuals: true });

    return updatedPost;
  }

  async getPostComments(postId: string) {
    const postObjectId = new Types.ObjectId(postId);

    // Fetch comments
    const post = await PostModel.findById(postObjectId)
      .select("comments") // only fetch comments
      .lean(); // return plain JS object

    if (!post) {
      return { comments: [], count: 0 };
    }

    const comments = post.comments || [];
    const count = comments.length;

    return { comments, count };
  }
}
export const postService = new PostServices();
