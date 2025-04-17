import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Coach from "../models/Coach.js";

dotenv.config();
const router = express.Router();

const DISCORD_API = "https://discord.com/api";

router.get("/auth/discord", (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(redirect);
});

router.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query;

  try {
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

    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const discordUser = userRes.data;

    let coach = await Coach.findOne({ discord_id: discordUser.id });
    if (!coach) {
      coach = await Coach.create({
        discord_id: discordUser.id,
        email: discordUser.email,
        name: discordUser.username
      });
    }

    const token = jwt.sign({ id: coach._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Redirect to a coach dashboard or profile creation
    res.redirect(`https://www.nevengi.com/coach_dashboard.html?token=${token}`);
  } catch (err) {
    console.error("Discord auth error:", err);
    res.status(500).send("OAuth failed");
  }
});

export default router;
