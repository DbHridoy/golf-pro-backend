import { model, Schema, Types } from "mongoose";

const ParticipantSchema = new Schema({
  convId: {
    type: Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "admin", "member"],
    default: "member",
  },
}, { timestamps: true });

const ConversationParticipantModel = model("ConversationParticipant", ParticipantSchema);
export default ConversationParticipantModel;
