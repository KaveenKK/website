import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import DecisionLog from "../models/DecisionLog.js";
import User from "../models/User.js";
import axios from "axios";

const router = express.Router();

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "https://decision-maker-857028785244.europe-west1.run.app";
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama2"; // You can change this if needed

async function braveSearch(query) {
  if (!BRAVE_API_KEY) return '';
  try {
    const res = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: { q: query, count: 3 },
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_API_KEY }
    });
    if (res.data && res.data.web && res.data.web.results) {
      return res.data.web.results.map(r => `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description}`).join('\n---\n');
    }
    return '';
  } catch (err) {
    console.error('[Brave API] Error:', err.response?.data || err.message);
    return '';
  }
}

function buildPrompt(question, user, braveResults) {
  return `User Question: ${question}\n\nUser Data:\n- Age: ${user.date_of_birth ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear() : 'N/A'}\n- Country: ${user.country || 'N/A'}\n- Gender: ${user.gender || 'N/A'}\n- Family: ${user.family || 'N/A'}\n- Income: ${user.additional || 'N/A'}\n- Physical: ${user.physical}\n- Mental: ${user.mental}\n- Social: ${user.social}\n- Love: ${user.love}\n- Career: ${user.career}\n- Creative: ${user.creative}\n- Travel: ${user.travel}\n- Style: ${user.style}\n- Spiritual: ${user.spiritual}\n\nRelevant Web Results:\n${braveResults || 'None'}\n\nBased on the above, give a personalized, thoughtful answer. If the decision is risky or unclear, ask follow-up questions to help the user reflect. If you need more info, ask for it. Always be empathetic and practical.`;
}

async function callOllama(prompt) {
  try {
    console.log('[Ollama API] Sending request:', {
      url: `${OLLAMA_API_URL}/api/chat`,
      body: { message: prompt },
      headers: { 'Content-Type': 'application/json' }
    });
    const res = await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      { message: prompt },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 180000, // 3 minutes for cold start
        validateStatus: status => status >= 200 && status < 500
      }
    );
    console.log('[Ollama API] Raw response:', res.data);
    if (res.data && res.data.response) return res.data.response;
    if (typeof res.data === 'string') return res.data;
    return JSON.stringify(res.data);
  } catch (err) {
    console.error('[Ollama API] Error:', err.response?.data || err.message);
    return 'Sorry, I could not process your request right now.';
  }
}

// POST /api/decision-helper
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { question, useWebSearch } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });

    // Fetch user data
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Brave search (optional)
    let braveResults = '';
    if (useWebSearch !== false) {
      braveResults = await braveSearch(question);
    }

    // 2. Build prompt
    const prompt = buildPrompt(question, user, braveResults);

    // 3. Call Ollama
    let aiResponse = await callOllama(prompt);
    if (typeof aiResponse !== 'string') {
      aiResponse = JSON.stringify(aiResponse);
    }

    // 4. Extract follow-up questions (simple heuristic: look for questions in the response)
    const followUpQuestions = [];
    const questionMatches = aiResponse && typeof aiResponse === 'string' ? aiResponse.match(/[^.?!]*\?/g) : null;
    if (questionMatches) {
      questionMatches.forEach(q => {
        if (q.length > 10 && !followUpQuestions.includes(q.trim())) followUpQuestions.push(q.trim());
      });
    }

    // 5. Log the interaction
    await DecisionLog.create({
      user: user._id,
      question,
      aiResponse,
      followUpQuestions
    });

    // Extra logging for outgoing response
    console.log('[Decision Helper] Sending response:', { response: aiResponse, followUpQuestions });

    // Always send a valid response field
    res.json({ response: aiResponse || 'Sorry, no response from AI.', followUpQuestions });
  } catch (err) {
    console.error("[Decision Helper] Error:", err);
    res.status(500).json({ error: "Failed to process decision helper request", response: "Sorry, an error occurred." });
  }
});

export default router; 