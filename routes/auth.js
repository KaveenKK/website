import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import Coach from "../models/Coach.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js"; // if needed for logout, etc.
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const router = express.Router();
const DISCORD_API = "https://discord.com/api";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// USER Discord Login (PWA)
router.get("/discord/user/pwa-start", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_USER_PWA_REDIRECT_URI,
    response_type: "code",
    scope: "identify email"
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params.toString()}`);
});

// STEP 2 – Callback endpoint for USERS
router.get("/discord/user/callback", async (req, res) => {
  console.log("[OAuth USER CALLBACK] Query:", req.query);
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
      // Issue a token with identity_completed: false
      const token = jwt.sign(
        { id: user._id, role: user.role, identity_completed: false },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ token, discord_id: discordUser.id, identity_completed: false });
    }

    // At this point identity_completed === true, so we can sign the token
    const token = jwt.sign(
      { id: user._id, role: user.role, identity_completed: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // PWA support: return JSON if pwa=true
    if (req.query.pwa === 'true') {
      return res.json({ token, discord_id: discordUser.id });
    }

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
  console.log("[OAuth COACH CALLBACK] Query:", req.query);
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

    // PWA support: return JSON if pwa=true
    if (req.query.pwa === 'true') {
      return res.json({ token, discord_id: discordUser.id });
    }

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

// STEP 2 – Callback endpoint for USERS (PWA only, JSON response)
router.get("/discord/user/pwa-callback", async (req, res) => {
  console.log("[OAuth USER PWA CALLBACK] Query:", req.query);
  const redirectUri = "https://www.nevengi.com/pwa-oauth-landing.html";
  console.log("[OAuth USER PWA CALLBACK] Using redirect_uri for token exchange:", redirectUri);
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
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
      // Issue a token with identity_completed: false
      const token = jwt.sign(
        { id: user._id, role: user.role, identity_completed: false },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ token, discord_id: discordUser.id, identity_completed: false });
    }

    // At this point identity_completed === true, so we can sign the token
    const token = jwt.sign(
      { id: user._id, role: user.role, identity_completed: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Always respond with JSON for PWA
    return res.json({ token, discord_id: discordUser.id, identity_completed: true });
  } catch (err) {
    console.error("OAuth User PWA Error:", err.response?.data || err.message);
    return res.status(500).json({ error: 'OAuth failed', details: err.response?.data || err.message });
  }
});

// STEP 2 – Callback endpoint for COACHES (PWA only, JSON response)
router.get("/discord/coach/pwa-callback", async (req, res) => {
  console.log("[OAuth COACH PWA CALLBACK] Query:", req.query);
  const redirectUri = "https://www.nevengi.com/pwa-oauth-landing-coach.html";
  console.log("[OAuth COACH PWA CALLBACK] Using redirect_uri for token exchange:", redirectUri);
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
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

    // Always respond with JSON for PWA
    const token = jwt.sign(
      { id: coach._id, role: coach.role || 'coach' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ token, discord_id: discordUser.id });
  } catch (err) {
    console.error("OAuth Coach PWA Error:", err.response?.data || err.message);
    return res.status(500).json({ error: 'OAuth failed', details: err.response?.data || err.message });
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

// --- Email Signup & Verification (Resend.com) ---

// POST /auth/email-signup
router.post('/email-signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user && user.verified) return res.status(400).json({ error: 'Email already registered and verified' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const code_expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  let hashedPassword = password;
  if (!user) hashedPassword = await bcrypt.hash(password, 10);
  const upsert = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        email: email.toLowerCase(),
        password: hashedPassword,
        verification_code: code,
        code_expiry,
        verified: false,
        provider: 'email',
      },
    },
    { upsert: true, new: true }
  );
  try {
    await resend.emails.send({
      from: 'Nevengi <no-reply@nevengi.com>',
      to: email,
      subject: 'Your Nevengi Verification Code',
      html: `<p>Your verification code is: <b>${code}</b></p><p>This code expires in 15 minutes.</p>`
    });
    return res.json({ success: true, message: 'Verification code sent to email.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send verification email.' });
  }
});

// POST /auth/email-verify
router.post('/email-verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (user.verified) return res.status(400).json({ error: 'Already verified' });
  if (!user.verification_code || !user.code_expiry) return res.status(400).json({ error: 'No code sent' });
  if (user.code_expiry < new Date()) return res.status(400).json({ error: 'Code expired' });
  if (user.verification_code !== code) return res.status(400).json({ error: 'Invalid code' });
  user.verified = true;
  user.verification_code = null;
  user.code_expiry = null;
  await user.save();
  // Issue JWT
  const token = jwt.sign({ id: user._id, role: user.role || 'user', identity_completed: user.identity_completed }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return res.json({ success: true, token });
});

// POST /auth/email-resend
router.post('/email-resend', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (user.verified) return res.status(400).json({ error: 'Already verified' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const code_expiry = new Date(Date.now() + 15 * 60 * 1000);
  user.verification_code = code;
  user.code_expiry = code_expiry;
  await user.save();
  try {
    await resend.emails.send({
      from: 'Nevengi <no-reply@nevengi.com>',
      to: email,
      subject: 'Your Nevengi Verification Code',
      html: `<p>Your verification code is: <b>${code}</b></p><p>This code expires in 15 minutes.</p>`
    });
    return res.json({ success: true, message: 'Verification code resent.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend verification email.' });
  }
});

export default router;
