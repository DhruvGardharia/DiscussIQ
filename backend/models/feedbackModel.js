import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion" },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participantName: { type: String },
  relevance: Number,
  flow: Number,
  constructiveness: Number,
  originality: Number,
  toxicity: Number,
  totalScore: Number,
  feedback: String
}, { timestamps: true });

export const ParticipantScore = mongoose.model("ParticipantScore", scoreSchema);
