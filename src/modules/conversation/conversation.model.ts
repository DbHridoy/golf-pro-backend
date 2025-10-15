import { model, Schema, Types } from "mongoose";

const ConversationSchema = new Schema({
  type:   { type: String, enum: ["private", "club", "group"], required: true },
  title:  { type: String },
  clubId: { type: Types.ObjectId, ref: "Club" },   // only for type=club
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default model("Conversation", ConversationSchema);