import ConversationModel from "./conversation.model";

class ConversationRepository {
  async createNewChannel(data) {
    const newChannel = new ConversationModel(data);
    return await newChannel.save();
  }

  async getAllChannels() {
    const channels = await ConversationModel.find({ type: "channel" })
      .populate("clubId", "clubName clubProfileImage")
      .populate("members", "fullName profileImage")
      .lean();
    return channels;
  }
}

const conversationRepository = new ConversationRepository();

export default conversationRepository;
