import { model, Schema } from "mongoose";

const ChannelSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  club: { type: Schema.Types.ObjectId, ref: "GolfClubProfile", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
}, {
  timestamps: true,
});

const ChannelModel = model("Channel", ChannelSchema);

export default ChannelModel;
