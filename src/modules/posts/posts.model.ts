import { model, Schema, Types } from "mongoose";

const CommentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    fullName: { type: String }, // snapshot of user name
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const LikeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    isLike: { type: Boolean, default: true },
  },
  { _id: false },
);

const PostSchema = new Schema(
  {
    // ============================
    // 🔹 Post Owner
    // ============================
    userId: { type: Types.ObjectId, required: true, ref: "User" },

    // ============================
    // 🔹 Main Content
    // ============================
    postTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    postImage: { type: String, trim: true, default: null },
    postVideo: { type: String, trim: true, default: null },

    // ============================
    // 🔹 Privacy & Status
    // ============================
    isPostPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },

    // ============================
    // 🔹 Tagged Users & Clubs
    // ============================
    taggedFriends: [{ type: Types.ObjectId, ref: "User" }],
    taggedClubs: [{ type: Types.ObjectId, ref: "User" }],

    // ============================
    // 🔹 Likes
    // ============================
    likedBy: [LikeSchema],

    // ============================
    // 🔹 Comments
    // ============================
    comments: [CommentSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },

  },
);

//
// ==============================================
// 🔹 Virtual Fields (Computed at runtime)
// ==============================================
//

// Count comments
PostSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

// Count likes
PostSchema.virtual("likeCount").get(function () {
  return this.likedBy?.filter((l: any) => l.isLike).length || 0;
});

// Whether a specific user liked the post (pass userId in lean results)
// PostSchema.virtual("isLikedByMe").get(function () {
//   return false; // You set this manually in your service later
// });

//
// ==============================================
// 🔹 Indexes for performance
// ==============================================
PostSchema.index({ userId: 1 });
PostSchema.index({ createdAt: -1 });

export const PostModel = model("Post", PostSchema);
export default PostModel;
