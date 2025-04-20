import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Coach from "../models/Coach.js";

dotenv.config();
const router = express.Router();

const DISCORD_API = "https://discord.com/api";

// STEP 1 - Start Discord OAuth login
router.get("/auth/discord", (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(redirect);
});

// STEP 2 - Handle callback from Discord
router.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Step 2.1 - Exchange code for access token
    const tokenRes = await axios.post(`${DISCORD_API}/oauth2/token`, new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      scope: "identify email"
    }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const accessToken = tokenRes.data.access_token;

    // Step 2.2 - Fetch user info
    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const discordUser = userRes.data;

    // Step 2.3 - Check if coach already exists
    let coach = await Coach.findOne({ discord_id: discordUser.id });

    if (!coach) {
      // Step 2.4 - Create new coach with full default structure
      coach = await Coach.create({
        discord_id: discordUser.id,
        email: discordUser.email,
        name: discordUser.username,
        specialties: [],
        approved: false,
        profile_picture: null,
        social_links: {
          instagram: null,
          twitter: null,
          linkedin: null,
          discord: null
        },
        experience: "",
        monthly_price_usd: 0,
        monthly_price_maples: 0,
        createdAt: new Date()
      });
    }

    // Step 2.5 - Issue JWT
    const token = jwt.sign({ id: coach._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Redirect to dashboard with token
    res.redirect(`https://www.nevengi.com/coach_dashboard.html?token=${token}`);
  } catch (err) {
    console.error("Discord auth error:", err);
    res.status(500).send("OAuth failed");
  }
});

export default router;
