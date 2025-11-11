import MessageModel from "@/modules/message/message.model.js";

export default function handleChannelChat(io, socket, channel, userId) {
  const roomId = `channel_${channel._id}`;
  socket.join(roomId);

  console.log(`🟢 User ${userId} joined channel room: ${roomId}`);

  socket.emit("connected", { roomId, channelId: channel._id });

  socket.on("send_message", async (data) => {
    if (!data.channelId && !data.receiverId) {
      throw new Error("Either channelId or receiverId must be provided");
    }
    try {
      const message = await MessageModel.create({
        channelId: channel._id,
        senderId: userId,
        receiverId: null,
        content: data.content,
        messageType: data.messageType || "text",
      });

      io.to(roomId).emit("receive_message", message);
    }
    catch (err) {
      console.error("Error sending channel message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User ${userId} left channel ${roomId}`);
  });
}
