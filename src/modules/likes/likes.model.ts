import { model, Schema } from "mongoose";

const LikeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Post",
    index: true,
  },
  isLike: {
    type: Boolean,
    default: true,
  },
});

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const LikeModel = model("Like", LikeSchema);

export default LikeModel;
