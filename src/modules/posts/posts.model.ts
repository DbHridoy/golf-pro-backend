import { Types } from "mongoose";

import { createPaginatedModel, createPaginatedSchema } from "@/utils/base-schema.utils";

import type { IPosts } from "./posts.interface";

const PostSchema = createPaginatedSchema<IPosts>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    postTitle: {
      type: String,
      trim: true,
      maxlength: [200, "Post title cannot exceed 200 characters"],
      default:null
    },
    postImage: {
      type: String,
      trim: true,
      default: null,
    },
    postVideo: {
      type: String,
      trim: true,
    },
    taggedFriends: {
      type: [
        {
          type: Types.ObjectId,
          ref: "GolferProfile",
        },
      ],
      default: [],
    },
    taggedClubs: {
      type: [
        {

          type: Types.ObjectId,
          ref: "GolfClub",
        },
      ],
      default: [],
    },
    isPostPublic: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
    // comments: {
    //   type: [
    //     {
    //       type: Types.ObjectId,
    //       ref: "Comment",
    //     },
    //   ],
    //   default: [],
    // }, // store all comment IDs
    // likes: {
    //   type: [
    //     {
    //       type: Types.ObjectId,
    //       ref: "Like",
    //     },
    //   ],
    //   default: [],
    // }, // store all like IDs
    // commentsCount: {
    //   type: Number,
    //   default: 0,
    // },
    // likesCount: {
    //   type: Number,
    //   default: 0,
    // },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: Record<string, any>, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for common queries
PostSchema.index({ userId: 1 });
PostSchema.index({ taggedClubs: 1 });
PostSchema.index({ isPostPublic: 1 });
PostSchema.index({ createdAt: -1 });

export const PostModel = createPaginatedModel<IPosts>("Post", PostSchema);
export default PostModel;
