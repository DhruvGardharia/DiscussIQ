import express from "express";
import { getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:discussionId", getMessages);

export default router;
