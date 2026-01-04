import { model, Schema } from "mongoose";

const ParticipantSchema = new Schema(
  {
    convId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const ConversationParticipantModel = model(
  "ConversationParticipant",
  ParticipantSchema,
);

export default ConversationParticipantModel;
