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
    enum: ["pending", "accepted", "rejected","cancelled"],
    default: "pending",
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc: Record<string, any>, ret: Record<string, any>) {
      delete ret.__v;
      return ret;
    },
  },
});

FriendSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });

const FriendModel = model("Friend", FriendSchema);

export default FriendModel;
