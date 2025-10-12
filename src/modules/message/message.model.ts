import { model, Schema } from "mongoose";

const MessageSchema = new Schema({
  channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: false },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  content: { type: String, required: true },
  messageType: { type: String, enum: ["text", "image", "file", "system"], default: "text" },
  isRead: { type: Boolean, default: false },
  editedAt: { type: Date },
}, { timestamps: true });

const MessageModel = model("Message", MessageSchema);
export default MessageModel;
