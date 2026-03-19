const express = require("express");
const ChatMessage = require("../models/ChatMessage");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// ── GET /api/chat-history ─────────────────────────────────────────
// Get last 20 messages for the user
router.get("/", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    // Reverse so oldest is first
    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

// ── POST /api/chat-history ────────────────────────────────────────
// Save a message to history
router.post("/", async (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) {
    return res.status(400).json({ error: "role and content are required." });
  }
  try {
    const message = await ChatMessage.create({ user: req.user._id, role, content });
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: "Failed to save message." });
  }
});

// ── DELETE /api/chat-history ──────────────────────────────────────
// Clear all chat history for user
router.delete("/", async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ message: "Chat history cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history." });
  }
});

module.exports = router;
