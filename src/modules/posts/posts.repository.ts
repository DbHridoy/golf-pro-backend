import mongoose from "mongoose";

import PostModel from "./posts.model";

class PostRepository {
  async getSinglePost(postId) {
    const post = await PostModel.findOne({ _id: postId }).lean();
    return post;
  }

  async getAllPosts() {
    return await PostModel.aggregate([
      {
        $lookup: {
          from: "posttags", // collection created by PostTagModel
          localField: "_id",
          foreignField: "postId",
          as: "tags",
          pipeline: [
            { $project: { _id: 0, taggedEntityId: 1, taggedEntityType: 1 } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async getAllPostsForUser(userId: string) {
    return await PostModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "posttags",
          localField: "_id",
          foreignField: "postId",
          as: "tags",
          pipeline: [
            { $project: { _id: 0, taggedEntityId: 1, taggedEntityType: 1 } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async togglePostStatus(postId, isActive) {
    const post = await PostModel.findOneAndUpdate({ _id: postId }, { isActive }, { new: true }).lean();
    return post;
  }
}

export const postRepository = new PostRepository();
