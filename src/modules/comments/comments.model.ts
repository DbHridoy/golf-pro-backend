import { model, Schema } from "mongoose";

const CommentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
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

const CommentModel = model("Comment", CommentSchema);

export default CommentModel;
