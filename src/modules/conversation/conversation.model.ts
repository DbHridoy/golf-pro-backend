import { model, Schema } from "mongoose";

const ConversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["private", "channel"],
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    clubId: { // ensure this matches your backend payload
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: Record<string, any>, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

const ConversationModel = model("Conversation", ConversationSchema);

export default ConversationModel;
