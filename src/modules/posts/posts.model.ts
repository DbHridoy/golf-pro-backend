import { model, Schema, Types } from "mongoose";

const PostSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  postTitle: {
    type: String,
    trim: true,
    maxlength: [200, "Post title cannot exceed 200 characters"],
    default: null,
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
  isPostPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc: Record<string, any>, ret: Record<string, any>) {
      delete ret.__v;
      return ret;
    },
  },
});

PostSchema.index({ userId: 1 });

export const PostModel = model("Post", PostSchema);

export default PostModel;
