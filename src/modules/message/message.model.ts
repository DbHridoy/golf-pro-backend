import { model, Schema } from "mongoose";

const MessageSchema = new Schema({
  convId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  content: { type: String, required: true },
  messageType: { type: String, enum: ["text", "image", "file", "system","video"], default: "text" },
  isRead: { type: Boolean, default: false },
  editedAt: { type: Date },
}, { timestamps: true });

MessageSchema.index({ convId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
const MessageModel = model("Message", MessageSchema);
export default MessageModel;
