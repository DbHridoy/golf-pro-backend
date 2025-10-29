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
    const posts = await PostModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // 🔹 Join with Users collection
      {
        $lookup: {
          from: "users", // ✅ must match the actual MongoDB collection name (lowercase, plural)
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            { $project: { fullName: 1, email: 1, _id: 0 } },
          ],
        },
      },
      { $unwind: "$user" }, // optional but makes it cleaner (single object instead of array)
      {
        $set: {
          userId: "$user",
        },
      },
      {
        $unset: "user",
      },

      // 🔹 Join with PostTags collection
      {
        $lookup: {
          from: "posttags",
          localField: "_id",
          foreignField: "postId",
          as: "tags",
        },
      },
      {
        $lookup: {
          from: "golfers",
          localField: "tags.taggedEntityId",
          foreignField: "_id",
          as: "golferTags",
        },
      },
      {
        $lookup: {
          from: "clubs",
          localField: "tags.taggedEntityId",
          foreignField: "_id",
          as: "clubTags",
        },
      },
      {
        $addFields: {
          tags: {
            $map: {
              input: "$tags",
              as: "tag",
              in: {
                $mergeObjects: [
                  "$$tag",
                  {
                    entity: {
                      $cond: [
                        { $eq: ["$$tag.taggedEntityType", "Golfer"] },
                        { $arrayElemAt: [
                          {
                            $filter: {
                              input: "$golferTags",
                              as: "g",
                              cond: { $eq: ["$$g._id", "$$tag.taggedEntityId"] },
                            },
                          },
                          0,
                        ] },
                        { $arrayElemAt: [
                          {
                            $filter: {
                              input: "$clubTags",
                              as: "c",
                              cond: { $eq: ["$$c._id", "$$tag.taggedEntityId"] },
                            },
                          },
                          0,
                        ] },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: { golferTags: 0, clubTags: 0 },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return posts;
  }

  async togglePostStatus(postId, isActive) {
    const post = await PostModel.findOneAndUpdate({ _id: postId }, { isActive }, { new: true }).lean();
    return post;
  }

  async getPostsByUserWithMedia(userId: string) {
    return PostModel.find({
      userId,
      $or: [
        { postImage: { $exists: true, $ne: null } },
        { postVideo: { $exists: true, $ne: null } },
      ],
    }).select("postImage postVideo");
  }
}

export const postRepository = new PostRepository();
