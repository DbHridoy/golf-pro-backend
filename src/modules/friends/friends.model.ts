import { model, Schema } from "mongoose";

const FriendSchema = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

}, {
  timestamps: true,
});

const FriendModel = model("Friend", FriendSchema);

export default FriendModel;
