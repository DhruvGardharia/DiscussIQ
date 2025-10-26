import express from "express";
import { createDiscussion, getDiscussion, evaluateDiscussion, getLeaderboard } from "../controllers/discussionController.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", isAuth, isAdmin, createDiscussion);
router.get("/", isAuth, async (req, res) => {
	// list discussions (admin can see all, users see active)
	try {
		const { Discussion } = await import('../models/discussionModel.js');
		if (req.user?.role === 'admin') {
			const all = await Discussion.find().populate('participants');
			return res.json(all);
		}
		const active = await Discussion.find({ isActive: true }).populate('participants');
		res.json(active);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
router.get("/:id", isAuth, getDiscussion);
router.post("/evaluate", isAuth, evaluateDiscussion);
router.get("/:id/leaderboard", isAuth, getLeaderboard);

export default router;
