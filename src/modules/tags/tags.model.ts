import { model, Schema, Types } from "mongoose";

const PostTagSchema = new Schema({
  postId: {
    type: Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  taggedEntityId: {
    type: Types.ObjectId,
    required: true,
    index: true,
  },
  taggedEntityType: {
    type: String,
    enum: ["Golfer", "GolfClub"],
    required: true,
    index: true,
  },
  taggedBy: {
    type: Types.ObjectId,
    ref: "User", // optional: who tagged them
  },
}, { timestamps: true });

export const PostTagModel = model("PostTag", PostTagSchema);
