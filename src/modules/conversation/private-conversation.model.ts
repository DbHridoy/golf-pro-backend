import { model, Schema } from "mongoose";

const PrivateConversationSchema = new Schema({
  type: {
    type: String,
    enum: ["private"],
    required: true,
  },
  userId1: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  userId2: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const PrivateConversationModel = model(
  "PrivateConversation",
  PrivateConversationSchema
);

export default PrivateConversationModel;
