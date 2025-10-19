import { model, Schema } from "mongoose";

const LikeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
  isLike: {
    type: Boolean,
    default: true,
  },
});

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const LikeModel = model("Like", LikeSchema);

export default LikeModel;
