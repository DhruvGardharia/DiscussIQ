import { Message } from "../models/messageModel.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ discussion: req.params.discussionId }).populate("sender");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
