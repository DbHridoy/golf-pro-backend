import { Schema, Types } from "mongoose";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

import type {IPosts } from "./posts.interface";

const PostSchema = createPaginatedSchema<IPosts>(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User", index: true },
    postTitle: { type: String, trim: true, maxlength: [200, "Post title cannot exceed 200 characters"] },
    postImage: { type: String, trim: true },
    taggedFriends: [{ type: Types.ObjectId, ref: "GolferProfile" }],
    taggedClub: { type: Types.ObjectId, ref: "GolfClub", required: true },
    isPostPublic: { type: Boolean, default: true },
    comments: [{ type: Types.ObjectId, ref: "Comment", default: [] }], // store all comment IDs
    likes: [{ type: Types.ObjectId, ref: "Like", default: [] }], // store all like IDs
    commentsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc:Record<string, any>, ret:Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for common queries
PostSchema.index({ userId: 1 });
PostSchema.index({ taggedClub: 1 });
PostSchema.index({ isPostPublic: 1 });
PostSchema.index({ createdAt: -1 });

// Virtuals for convenience
PostSchema.virtual("likesCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

PostSchema.virtual("commentsCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

export const PostModel = createPaginatedModel<IPosts>("Post", PostSchema);
export default PostModel;
