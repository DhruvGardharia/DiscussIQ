import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: { type: String },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Discussion = mongoose.model("Discussion", discussionSchema);
