import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import DecisionLog from "../models/DecisionLog.js";
import User from "../models/User.js";

const router = express.Router();

// POST /api/decision-helper
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });

    // Fetch user data (for future AI context)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // TODO: Integrate with Ollama and Brave API here
    // For now, return a mock AI response and follow-up questions
    const aiResponse = `This is a mock AI response to: "${question}"`;
    const followUpQuestions = [
      "Can you tell me more about your motivation?",
      "How urgent is this decision for you?"
    ];

    // Log the interaction
    await DecisionLog.create({
      user: user._id,
      question,
      aiResponse,
      followUpQuestions
    });

    res.json({ response: aiResponse, followUpQuestions });
  } catch (err) {
    console.error("[Decision Helper] Error:", err);
    res.status(500).json({ error: "Failed to process decision helper request" });
  }
});

export default router; 