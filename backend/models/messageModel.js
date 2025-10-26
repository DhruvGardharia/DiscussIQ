import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
