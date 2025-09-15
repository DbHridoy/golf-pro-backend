// Post Schema
const PostSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  authorType: { type: String, enum: ["golfer", "golf_club"], required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  videos: [{ type: String }],
  gameData: {
    scorecardId: { type: Schema.Types.ObjectId, ref: "Scorecard" },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  isPublic: { type: Boolean, default: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
  clubId: { type: Schema.Types.ObjectId, ref: "GolfClubProfile" },
}, { timestamps: true });

// Comment Schema
const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isEdited: { type: Boolean, default: false },
}, { timestamps: true });

// Channel Schema
const ChannelSchema = new Schema({
  title: { type: String, required: true },
  clubId: { type: Schema.Types.ObjectId, ref: "GolfClubProfile", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "GolferProfile" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });

// Message Schema
const MessageSchema = new Schema({
  channelId: { type: Schema.Types.ObjectId, ref: "Channel" },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  messageType: { type: String, enum: ["text", "image", "file", "system"], default: "text" },
  isRead: { type: Boolean, default: false },
  editedAt: { type: Date },
}, { timestamps: true });
