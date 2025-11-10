import ConversationModel from "./conversation.model";

class ConversationRepository {
  async createNewChannel(data) {
    const newChannel = new ConversationModel(data);
    return await newChannel.save();
  }
  async getAllChannels(){
    const channels=ConversationModel.find({type:"channel"}).populate("club","clubName clubProfileImage").lean()
    return channels
  }
 
}

const conversationRepository = new ConversationRepository();

export default conversationRepository;
