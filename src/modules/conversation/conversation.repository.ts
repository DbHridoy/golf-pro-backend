import ConversationModel from "./conversation.model";

class ConversationRepository {
  async createNewChannel(data) {
    const newChannel = new ConversationModel(data);
    return await newChannel.save();
  }
 
}

const conversationRepository = new ConversationRepository();

export default conversationRepository;
