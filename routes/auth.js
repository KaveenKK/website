import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js"; // if needed for logout, etc.

const router = express.Router();
const DISCORD_API = "https://discord.com/api";

// STEP 1 - Redirect to Discord OAuth2
// Mount this at /auth/discord
router.get("/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email"
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params.toString()}`);
});

// STEP 2 - Callback endpoint
// Mount this at /auth/discord/callback
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect('/login'); // or your login page
  }

  try {
    // Exchange code for token
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

    // Fetch user info
    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const discordUser = userRes.data;

    // Find or create coach
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
        role: "coach" // set default role
      });
    }

    // Issue JWT including role
    const token = jwt.sign(
      { id: coach._id, role: coach.role || 'coach' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect with JWT
    return res.redirect(`${process.env.FRONTEND_URL}/coach_dashboard.html?token=${token}`);
  } catch (err) {
    console.error("Discord auth error:", err.response?.data || err.message);
    if (err.response?.status === 429) {
      const retryAfter = err.response.headers['retry-after'] || 5;
      return res.status(429).send(`Rate limit hit; retry in ${retryAfter}s`);
    }
    return res.status(500).send("OAuth failed");
  }
});

export default router;
