import ChannelModel from "./channel.model";

class ChannelRepository {
  async createChannel(data) {
    const channel = await ChannelModel.create(data);
    return channel;
  }

  async getChannel(id) {
    const channel = await ChannelModel.findById(id);
    return channel;
  }

  async getAllChannels() {
    const channels = await ChannelModel.find({}).populate("members", "fullName profileImage");
    return channels;
  }

  async updateChannel(id, data) {
    const channel = await ChannelModel.findByIdAndUpdate(id, data, { new: true });
    return channel;
  }

  async deleteChannel(id) {
    const channel = await ChannelModel.findByIdAndDelete(id);
    return channel;
  }
}

export const channelRepository = new ChannelRepository();
