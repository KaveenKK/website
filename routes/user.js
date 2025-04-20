import express from "express";
import User from "../models/User.js";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/submit
 * Upsert user profile from initial form submission
 */
router.post("/submit", async (req, res) => {
  const {
    discord_id,
    physical,
    mental,
    social,
    love,
    career,
    creative,
    travel,
    family,
    style,
    spiritual,
    additional,
    date_of_birth,
    country,
    gender,
    ...rest
  } = req.body;

  if (!discord_id) return res.status(400).json({ error: "Missing discord_id" });
  const stringDiscordId = String(discord_id);
  console.log("🧪 Incoming form data:", req.body);

  // Validate age
  const birthDate = new Date(date_of_birth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  if (age < 13) return res.status(403).json({ error: "You must be at least 13 years old to register" });
  if (age > 100) return res.status(400).json({ error: "Please enter a valid age under 100" });

  // Extract checked channels
  const channels = Object.entries(rest)
    .filter(([key, value]) => key.startsWith("channel_") && value === "on")
    .map(([key]) => key.replace('channel_', ''));

  try {
    console.log("🧪🧪🧪 YES – This backend is being used");
    const updated = await User.updateOne(
      { discord_id: stringDiscordId },
      {
        $set: {
          physical,
          mental,
          social,
          love,
          career,
          creative,
          travel,
          family,
          style,
          spiritual,
          additional,
          date_of_birth: birthDate,
          country,
          gender,
          identity_completed: true,
          channels,
        },
      }
    );
    res.json({ message: "Profile updated", updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * GET /api/coaches
 * List all approved coaches for users to explore
 */
router.get('/coaches', authMiddleware, async (req, res) => {
  try {
    const coaches = await Coach.find({ approved: true })
      .select('name specialties monthly_price_maples profile_picture');
    res.json(coaches);
  } catch (err) {
    console.error('❌ Error fetching coaches:', err);
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});

/**
 * POST /api/subscribe
 * Subscribe the current user to a coach
 * Body: { coachId: string }
 */
router.post('/subscribe', authMiddleware, async (req, res) => {
  const { coachId } = req.body;
  const userId = req.user.id;
  try {
    const coach = await Coach.findById(coachId);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    if (coach.subscribers.includes(userId)) {
      return res.status(400).json({ error: 'Already subscribed' });
    }
    coach.subscribers.push(userId);
    await coach.save();

    const user = await User.findById(userId);
    user.maples = (user.maples || 0) - coach.monthly_price_maples;
    user.subscriptions = user.subscriptions || [];
    user.subscriptions.push(coachId);
    await user.save();

    res.json({ success: true, coachId, remainingMaples: user.maples });
  } catch (err) {
    console.error('❌ Subscription error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * POST /api/rate
 * Add a rating for a coach
 * Body: { coachId: string, rating: number }
 */
router.post('/rate', authMiddleware, async (req, res) => {
  const { coachId, rating } = req.body;
  const userId = req.user.id;
  try {
    const coach = await Coach.findById(coachId);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    coach.ratings = coach.ratings || [];
    coach.ratings = coach.ratings.filter(r => r.user.toString() !== userId);
    coach.ratings.push({ user: userId, rating: Number(rating) });
    await coach.save();

    const avg = coach.ratings.reduce((sum, r) => sum + r.rating, 0) / coach.ratings.length;
    res.json({ success: true, averageRating: avg.toFixed(2) });
  } catch (err) {
    console.error('❌ Rating error:', err);
    res.status(500).json({ error: 'Failed to rate coach' });
  }
});

/**
 * GET /api/leaderboard
 * Returns top users by XP
 */
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ xp: -1 })
      .limit(10)
      .select('username xp');
    res.json(topUsers);
  } catch (err) {
    console.error('❌ Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/status
 * Returns the current user's XP and Maples
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('xp maples');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ xp: user.xp || 0, maples: user.maples || 0 });
  } catch (err) {
    console.error('❌ Status error:', err);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
