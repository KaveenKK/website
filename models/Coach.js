import mongoose from "mongoose";

const coachSchema = new mongoose.Schema({
  discord_id:    { type: String, unique: true, required: true },
  email:         { type: String, required: true },
  name:          { type: String, required: true },
  age:           { type: Number },
  bio:           { type: String },           // if you still need this
  specialties:   [String],

  // ────────────────────────────────────────────────────────
  // New fields for your dashboard & Maple system
  approved: {
    type: Boolean,
    default: false                      // coaches start un‑approved
  },
  profile_picture: {
    type: String,
    default: null
  },
  social_links: {
    instagram: { type: String, default: null },
    twitter:   { type: String, default: null },
    linkedin:  { type: String, default: null },
    discord:   { type: String, default: null }
  },
  experience: {
    type: String,
    default: ""                         // coach bio/summary
  },
  monthly_price_usd: {
    type: Number,
    default: 0,                         // $0–$20 range
    min: 0,
    max: 20
  },
  monthly_price_maples: {
    type: Number,
    default: 0                          // auto‑calculated
  },
  // ────────────────────────────────────────────────────────

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Coach", coachSchema);
