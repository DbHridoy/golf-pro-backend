import { model, Schema } from "mongoose";

const ChannelSchema = new Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
  timestamps: true,
});

const ChannelModel = model("Channel", ChannelSchema);

export default ChannelModel;
