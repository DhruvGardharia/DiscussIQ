import { Message } from "../models/messageModel.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("join_discussion", (discussionId) => {
      socket.join(discussionId);
      console.log(`User joined discussion: ${discussionId}`);
    });

    socket.on("send_message", async (data) => {
      const { discussionId, userId, text } = data;

      try {
        // First emit a temporary message for immediate feedback
        const tempMessage = {
          _id: 'temp_' + Date.now(),
          discussion: discussionId,
          sender: userId,
          text,
          temp: true
        };
        io.in(discussionId).emit("receive_message", tempMessage);

        // Then persist and emit the real message
        const message = await Message.create({ discussion: discussionId, sender: userId, text });
        const populated = await Message.findById(message._id)
          .populate('sender', 'name email')
          .populate('discussion', 'topic');
        
        // Broadcast the persisted message to all clients
        io.in(discussionId).emit("receive_message", {
          ...populated.toObject(),
          temp: false,
          replaces: tempMessage._id
        });
        
        console.log(`Message broadcast to discussion ${discussionId} from ${populated.sender?.name || userId}`);
      } catch (err) {
        console.error('Error handling message:', err);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
};
