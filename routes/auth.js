import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import Coach from "../models/Coach.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js"; // if needed for logout, etc.

const router = express.Router();
const DISCORD_API = "https://discord.com/api";

// STEP 1 – Redirect to Discord OAuth2
// USER Discord Login
router.get("/discord/user", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_USER_REDIRECT_URI,
    response_type: "code",
    scope: "identify email"
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params.toString()}`);
});

// COACH Discord Login
router.get("/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email"
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params.toString()}`);
});

// STEP 2 – Callback endpoint for USERS
router.get("/discord/user/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login');

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_USER_REDIRECT_URI,
        scope: "identify email"
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Fetch user info from Discord
    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const discordUser = userRes.data;

    // Find or create our User record
    let user = await User.findOne({ discord_id: discordUser.id });
    if (!user) {
      user = await User.create({
        discord_id: discordUser.id,
        email: discordUser.email,
        username: discordUser.username,
        avatar: discordUser.avatar || null,
        identity_completed: false,
        xp: 0,
        maples: 0,
        role: 'user'
      });
    } else if (user.avatar !== discordUser.avatar) {
      user.avatar = discordUser.avatar || null;
      await user.save();
    }

    // Only issue a JWT once they've completed identity check
    if (!user.identity_completed) {
      // Redirect them to a "complete your registration" page
      return res.redirect(
        `/complete-registration.html?discord_id=${encodeURIComponent(discordUser.id)}`
      );
    }

    // At this point identity_completed === true, so we can sign the token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to user dashboard with token & discord_id
    return res.redirect(
      `/user_dashboard.html?token=${token}&discord_id=${encodeURIComponent(discordUser.id)}`
    );
  } catch (err) {
    console.error("OAuth User Error:", err.response?.data || err.message);
    return res.status(500).send("OAuth failed");
  }
});

// STEP 2 – Callback endpoint for COACHES
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login');

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        scope: "identify email"
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Fetch coach info from Discord
    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const discordUser = userRes.data;

    // Find or create our Coach record
    let coach = await Coach.findOne({ discord_id: discordUser.id });
    if (!coach) {
      coach = await Coach.create({
        discord_id: discordUser.id,
        email: discordUser.email,
        name: discordUser.username,
        specialties: [],
        approved: false,
        profile_picture: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        social_links: { instagram: null, twitter: null, linkedin: null, discord: null },
        experience: "",
        monthly_price_usd: 0,
        monthly_price_maples: 0,
        role: "coach"
      });
    }

    // Sign JWT for coach
    const token = jwt.sign(
      { id: coach._id, role: coach.role || 'coach' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to coach dashboard with token & discord_id
    return res.redirect(
      `/coach_dashboard.html?token=${token}&discord_id=${encodeURIComponent(discordUser.id)}`
    );
  } catch (err) {
    console.error("Discord auth error:", err.response?.data || err.message);
    if (err.response?.status === 429) {
      const retryAfter = err.response.headers['retry-after'] || 5;
      return res.status(429).send(`Rate limit hit; retry in ${retryAfter}s`);
    }
    return res.status(500).send("OAuth failed");
  }
});

// Token validation endpoints
router.get("/validate-user", authMiddleware, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: "Invalid token type" });
  }
  res.json({ valid: true });
});

router.get("/validate-coach", authMiddleware, (req, res) => {
  if (req.user.role !== 'coach') {
    return res.status(403).json({ error: "Invalid token type" });
  }
  res.json({ valid: true });
});

export default router;
