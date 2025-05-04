import express from "express";
import User from "../models/User.js";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js";
import WeeklyReport from '../models/WeeklyReport.js';

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
    console.log("🧪🧪🧪 Upserting user profile");
    const user = await User.findOneAndUpdate(
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
      },
      { upsert: true, new: true }
    );
    return res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * GET /api/coaches
 * List all approved coaches for users to explore
 */
router.get('/coaches', authMiddleware, async (req, res) => {
  try {
    const coaches = await Coach.find({ approved: true })
      .select('name specialties monthly_price_maples profile_picture social_links experience average_rating');
    return res.json(coaches);
  } catch (err) {
    console.error('❌ Error fetching coaches:', err);
    return res.status(500).json({ error: 'Failed to fetch coaches' });
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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check duplicate
    if (user.my_coaches.some(c => c.coach_id.toString() === coachId)) {
      return res.status(400).json({ error: 'Already subscribed to this coach' });
    }

    // Add to user.my_coaches
    user.my_coaches.push({
      coach_id: coach._id,
      coach_name: coach.name
    });

    // Deduct maples
    user.maples = (user.maples || 0) - coach.monthly_price_maples;
    await user.save();

    // Add subscriber to coach
    if (!coach.subscribers.some(id => id.toString() === userId)) {
      coach.subscribers.push(userId);
    }
    await coach.save();

    return res.json({ success: true, my_coaches: user.my_coaches });
  } catch (err) {
    console.error('❌ Subscription error:', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * POST /api/unsubscribe
 * Remove subscription
 */
router.post('/unsubscribe', authMiddleware, async (req, res) => {
  const { coachId } = req.body;
  const userId = req.user.id;
  try {
    const coach = await Coach.findById(coachId);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove from user.my_coaches
    user.my_coaches = user.my_coaches.filter(c => c.coach_id.toString() !== coachId);
    await user.save();

    // Remove from coach.subscribers
    coach.subscribers = coach.subscribers.filter(id => id.toString() !== userId);
    await coach.save();

    return res.json({ success: true, my_coaches: user.my_coaches });
  } catch (err) {
    console.error('❌ Unsubscribe error:', err);
    return res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

/**
 * GET /api/my_coaches
 * Returns list of this user's subscribed coaches
 */
router.get('/my_coaches', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('my_coaches');
    return res.json(user.my_coaches || []);
  } catch (err) {
    console.error('❌ My coaches error:', err);
    return res.status(500).json({ error: 'Failed to fetch your coaches' });
  }
});

/**
 * POST /api/rate
 * Add a rating for a coach
 */
router.post('/rate', authMiddleware, async (req, res) => {
  const { coachId, rating } = req.body;
  const userId = req.user.id;
  try {
    const coach = await Coach.findById(coachId);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    // Replace any previous rating by this user
    coach.ratings = coach.ratings.filter(r => r.user.toString() !== userId);
    coach.ratings.push({ user: userId, rating: Number(rating) });
    // Calculate and save average rating
    const avg = coach.ratings.reduce((sum, r) => sum + r.rating, 0) / coach.ratings.length;
    coach.average_rating = avg;
    await coach.save();

    return res.json({ success: true, averageRating: avg.toFixed(2) });
  } catch (err) {
    console.error('❌ Rating error:', err);
    return res.status(500).json({ error: 'Failed to rate coach' });
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
    return res.json(topUsers);
  } catch (err) {
    console.error('❌ Leaderboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
    return res.json({ xp: user.xp || 0, maples: user.maples || 0 });
  } catch (err) {
    console.error('❌ Status error:', err);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
});

/**
 * GET /api/user-profile
 * Returns the current user's profile (for dashboard)
 */
router.get('/user-profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('discord_id username avatar email xp maples gender physical mental social love career creative travel family style spiritual');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('❌ User profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * GET /api/reports
 * Returns all weekly reports for the logged-in user
 */
router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ user: req.user.id }).sort({ year: -1, weekNumber: -1 });
    res.json(reports);
  } catch (err) {
    console.error('❌ Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * POST /api/reports/:weekNumber
 * Add or update a weekly report for the user
 * Body: { data }
 */
router.post('/reports/:weekNumber', authMiddleware, async (req, res) => {
  try {
    const { weekNumber } = req.params;
    const { data } = req.body;
    const year = new Date().getFullYear();
    const report = await WeeklyReport.findOneAndUpdate(
      { user: req.user.id, weekNumber, year },
      { $set: { data } },
      { upsert: true, new: true }
    );
    res.json(report);
  } catch (err) {
    console.error('❌ Error saving report:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

/**
 * POST /api/reports/:weekNumber/review
 * Coach adds a review for a user's week
 * Body: { userId, review }
 */
router.post('/reports/:weekNumber/review', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'coach') return res.status(403).json({ error: 'Only coaches can add reviews' });
    const { weekNumber } = req.params;
    const { userId, review } = req.body;
    const year = new Date().getFullYear();
    const coach = await Coach.findById(req.user.id);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });
    const report = await WeeklyReport.findOneAndUpdate(
      { user: userId, weekNumber, year },
      { $push: { reviews: { coach: coach._id, coach_name: coach.name, review } } },
      { upsert: true, new: true }
    );
    res.json(report);
  } catch (err) {
    console.error('❌ Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

/**
 * POST /api/claim-new-user-xp
 * Claim 200 XP as a new user reward
 */
router.post('/claim-new-user-xp', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.claimed_new_user_xp) {
      return res.json({ success: true, claimed: false });
    }
    user.xp = (user.xp || 0) + 200;
    user.claimed_new_user_xp = true;
    await user.save();
    return res.json({ success: true, claimed: true });
  } catch (err) {
    console.error('❌ Claim new user XP error:', err);
    res.status(500).json({ success: false, error: 'Failed to claim reward' });
  }
});

export default router;
