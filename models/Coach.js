import mongoose from "mongoose";

// Sub-schema for ratings
const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { _id: false });

const coachSchema = new mongoose.Schema({
  discord_id:    { type: String, unique: true, required: true },
  email:         { type: String, required: true },
  name:          { type: String, required: true },
  birthdate:     { type: Date },
  bio:           { type: String },


  // ────────────────────────────────────────────────────────
  // New fields for your dashboard & Maple system
  approved: {
    type: Boolean,
    default: false  // coaches start un‑approved
  },
  profile_picture: {
    type: String,
    default: null
  },
  social_links: {
    instagram: { type: String, default: null },
    twitter:   { type: String, default: null },
    linkedin:  { type: String, default: null },
    youtube:  { type: String, default: null },
    tiktok:   { type: String, default: null },
    threads:  { type: String, default: null },
    facebook: { type: String, default: null }
  },
  experience: {
    type: String,
    default: ""  // coach bio/summary
  },
  monthly_price_usd: {
    type: Number,
    default: 0,                         // $0–$20 range
    min: 0,
    max: 20
  },
  monthly_price_maples: {
    type: Number,
    default: 0  // auto‑calculated
  },
  
  // Subscribers: users who have subscribed to this coach
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Ratings given by users
  ratings: [ratingSchema],

  // ────────────────────────────────────────────────────────
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Coach", coachSchema);
