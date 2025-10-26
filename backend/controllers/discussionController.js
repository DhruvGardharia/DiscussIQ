import { Discussion } from "../models/discussionModel.js";
import { evaluateSession } from "../utils/mlClient.js";
import mongoose from 'mongoose';
import { ParticipantScore } from "../models/feedbackModel.js";

export const createDiscussion = async (req, res) => {
  try {
    // Only admin can create discussion
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create discussions' });
    }

    const { topic, participants } = req.body;
    const createdBy = req.user._id;
    const createdByName = req.user.name;
    const discussion = await Discussion.create({ topic, participants, createdBy, createdByName });
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate("participants");
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forward messages to ML engine for evaluation. Expects { topic, messages, session_id }
export const evaluateDiscussion = async (req, res) => {
  try {
    const { topic, messages, session_id } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be a non-empty array' });
    }

    const payload = { topic, messages, session_id };
    const results = await evaluateSession(payload);
    
    // Validate ML service response structure
    if (!results || typeof results !== 'object') {
      throw new Error('Invalid response from ML service');
    }

    // Persist per-participant results to DB and build leaderboard
    const saved = [];
    const leaderboard = [];

    for (const [participantKey, data] of Object.entries(results)) {
      // participantKey may be an ObjectId string or a display name
      let participant = null;
      let participantName = null;
      if (mongoose.Types.ObjectId.isValid(participantKey)) {
        participant = participantKey;
      } else {
        participantName = participantKey;
      }

      // Validate metrics from ML service
      const metrics = data.metrics || {};
      
      const doc = await ParticipantScore.create({
        discussion: req.body.discussion_id || null,
        participant,
        participantName,
        relevance: metrics.relevance ?? null,
        flow: metrics.flow ?? null,
        constructiveness: metrics.constructiveness ?? null,
        originality: metrics.originality ?? null,
        toxicity: metrics.toxicity ?? null,
        totalScore: data.score ?? 0, // Default to 0 for missing score
        feedback: data.feedback ?? null,
      });

      saved.push(doc);
      leaderboard.push({ participant: participant || participantName, score: data.score ?? 0 });
    }

    // Sort leaderboard descending
    leaderboard.sort((a, b) => b.score - a.score);

    res.json({ success: true, results, saved_count: saved.length, leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const discussionId = req.params.id;
    if (!discussionId) return res.status(400).json({ error: 'discussion id required' });

    // Get discussion for context
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    // Get scores and populate participant details
    const scores = await ParticipantScore.find({ discussion: discussionId })
      .sort({ totalScore: -1 })
      .populate('participant', 'name email')
      .lean();

    // Calculate rankings and enriched stats
    const enrichedScores = scores.map((score, index) => {
      const rank = index + 1;
      const displayName = score.participant?.name || score.participantName || 'Anonymous';
      
      // Calculate percentile (1-100, higher is better)
      const percentile = Math.round(((scores.length - rank + 1) / scores.length) * 100);
      
      return {
        ...score,
        rank,
        displayName,
        percentile,
        rankSuffix: getRankSuffix(rank),
        // Add score breakdown from metrics
        scoreBreakdown: {
          relevance: Math.round(score.relevance * 100),
          flow: Math.round(score.flow * 100),
          constructiveness: Math.round(score.constructiveness * 100),
          originality: Math.round(score.originality * 100),
          toxicity: Math.round(score.toxicity * 100)
        }
      };
    });

    res.json({
      discussion: {
        topic: discussion.topic,
        totalParticipants: scores.length,
      },
      scores: enrichedScores,
      stats: {
        averageScore: Math.round(enrichedScores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length),
        topScore: enrichedScores[0]?.totalScore || 0,
        participationRate: enrichedScores[0]?.stats?.participation_rate || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper for rank suffixes (1st, 2nd, 3rd, etc)
function getRankSuffix(rank) {
  if (rank > 3 && rank < 21) return 'th';
  switch (rank % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}