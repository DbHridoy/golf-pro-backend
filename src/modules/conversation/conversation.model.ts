import { model, Schema, Types } from "mongoose";

const ConversationSchema = new Schema({
  type: {
    type: String,
    enum: ["private", "club", "group"],
    required: true,
  },
  title: {
    type: String,
  },
  clubId: {
    type: Types.ObjectId,
    ref: "Club",
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
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

export default model("Conversation", ConversationSchema);
