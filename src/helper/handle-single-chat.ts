import MessageModel from "@/modules/message/message.model.js";

export default function handleSingleChat(io, socket, chatWith, userId) {
  // Create a unique room for these two users
  const roomId = [userId, chatWith].sort().join("_");
  socket.join(roomId);

  console.log(`🟢 User ${userId} joined single chat room: ${roomId}`);

  // Notify when connected
  socket.emit("connected", { roomId });

  // Handle incoming messages
  socket.on("send_message", async (data) => {
    if (!data.channelId && !data.receiverId) {
      throw new Error("Either channelId or receiverId must be provided");
    }
    try {
      const message = await MessageModel.create({
        channelId: null, // not a channel message
        senderId: userId,
        receiverId: chatWith,
        content: data.content,
        messageType: data.messageType || "text",
      });

      // Emit to both users
      io.to(roomId).emit("receive_message", message);
    }
    catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔴 User ${userId} left single chat room ${roomId}`);
  });
}
