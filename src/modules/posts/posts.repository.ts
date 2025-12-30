import mongoose from "mongoose";

import PostModel from "./posts.model";

class PostRepository {
  async getSinglePost(postId) {
    const post = await PostModel.findOne({ _id: postId }).lean();
    return post;
  }

  async getAllPosts() {
    const posts = await PostModel.find()
    .populate([
      { path: "userId", select: "fullName email profileImage" },
      { path: "taggedFriends.userId", select: "fullName email profileImage" },
      { path: "taggedClubs.clubId", select: "name description logo" },
      { path: "likedBy.userId", select: "fullName profileImage" },
      { path: "comments.userId", select: "fullName profileImage" },
    ])
    .sort({ createdAt: -1 });
    return posts
  }

  // async getAllPostsForUser(userId: string) {
  //   const posts = await PostModel.aggregate([
  //     {
  //       $match: {
  //         userId: new mongoose.Types.ObjectId(userId),
  //       },
  //     },

  //     // 1️⃣ Populate userId → post owner
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "userId",
  //         foreignField: "_id",
  //         as: "user",
  //         pipeline: [
  //           { $project: { fullName: 1, email: 1, profileImage: 1 } },
  //         ],
  //       },
  //     },
  //     { $unwind: "$user" },

  //     // 2️⃣ Populate tagged friends
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "taggedFriends.userId",
  //         foreignField: "_id",
  //         as: "taggedFriendsData",
  //         pipeline: [
  //           { $project: { fullName: 1, email: 1, profileImage: 1 } },
  //         ],
  //       },
  //     },

  //     // Merge each tagged friend's user data
  //     {
  //       $addFields: {
  //         taggedFriends: {
  //           $map: {
  //             input: "$taggedFriends",
  //             as: "f",
  //             in: {
  //               $mergeObjects: [
  //                 "$$f",
  //                 {
  //                   user: {
  //                     $arrayElemAt: [
  //                       {
  //                         $filter: {
  //                           input: "$taggedFriendsData",
  //                           as: "u",
  //                           cond: { $eq: ["$$u._id", "$$f.userId"] },
  //                         },
  //                       },
  //                       0,
  //                     ],
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     },

  //     // 3️⃣ Populate tagged clubs
  //     {
  //       $lookup: {
  //         from: "clubs",
  //         localField: "taggedClubs.clubId",
  //         foreignField: "_id",
  //         as: "taggedClubsData",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         taggedClubs: {
  //           $map: {
  //             input: "$taggedClubs",
  //             as: "c",
  //             in: {
  //               $mergeObjects: [
  //                 "$$c",
  //                 {
  //                   club: {
  //                     $arrayElemAt: [
  //                       {
  //                         $filter: {
  //                           input: "$taggedClubsData",
  //                           as: "cl",
  //                           cond: { $eq: ["$$cl._id", "$$c.clubId"] },
  //                         },
  //                       },
  //                       0,
  //                     ],
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     },

  //     // 4️⃣ Populate likedBy users
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "likedBy.userId",
  //         foreignField: "_id",
  //         as: "likedByData",
  //         pipeline: [
  //           { $project: { fullName: 1, profileImage: 1 } },
  //         ],
  //       },
  //     },
  //     {
  //       $addFields: {
  //         likedBy: {
  //           $map: {
  //             input: "$likedBy",
  //             as: "l",
  //             in: {
  //               $mergeObjects: [
  //                 "$$l",
  //                 {
  //                   user: {
  //                     $arrayElemAt: [
  //                       {
  //                         $filter: {
  //                           input: "$likedByData",
  //                           as: "u",
  //                           cond: { $eq: ["$$u._id", "$$l.userId"] },
  //                         },
  //                       },
  //                       0,
  //                     ],
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     },

  //     // 5️⃣ Populate comments.userId
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "comments.userId",
  //         foreignField: "_id",
  //         as: "commentUsers",
  //         pipeline: [
  //           { $project: { fullName: 1, profileImage: 1 } },
  //         ],
  //       },
  //     },
  //     {
  //       $addFields: {
  //         comments: {
  //           $map: {
  //             input: "$comments",
  //             as: "c",
  //             in: {
  //               $mergeObjects: [
  //                 "$$c",
  //                 {
  //                   user: {
  //                     $arrayElemAt: [
  //                       {
  //                         $filter: {
  //                           input: "$commentUsers",
  //                           as: "u",
  //                           cond: { $eq: ["$$u._id", "$$c.userId"] },
  //                         },
  //                       },
  //                       0,
  //                     ],
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     },

  //     // Cleanup temp fields
  //     {
  //       $project: {
  //         taggedFriendsData: 0,
  //         taggedClubsData: 0,
  //         likedByData: 0,
  //         commentUsers: 0,
  //       },
  //     },

  //     { $sort: { createdAt: -1 } },
  //   ]);

  //   return posts;
  // }
async getAllPostsForUser(userId: string) {
  const userObjId = new mongoose.Types.ObjectId(userId);

  const posts = await PostModel.find({ userId: userObjId })
    .populate([
      { path: "userId", select: "fullName email profileImage" },
      { path: "taggedFriends", select: "fullName email" },
      { path: "taggedClubs", select: "fullName email" },
      { path: "likedBy.userId", select: "fullName profileImage" },
      { path: "comments.userId", select: "fullName profileImage" },
    ])
    .sort({ createdAt: -1 });

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
