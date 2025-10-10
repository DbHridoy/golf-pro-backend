import { model, Schema } from "mongoose";

const MessageSchema = new Schema({
  channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ["text", "image", "file", "system"], default: "text" },
  isRead: { type: Boolean, default: false },
  editedAt: { type: Date },
});

const MessageModel = model("Message", MessageSchema);
export default MessageModel;
