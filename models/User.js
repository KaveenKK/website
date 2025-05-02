import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  discord_id: { type: String, required: true, unique: true },
  username: { type: String },
  email: { type: String },
  verified: { type: Boolean, default: false },
  verification_code: { type: String, default: null },
  code_expiry: { type: Date, default: null },

  // Life ratings
  physical: { type: Number, default: 0 },
  mental: { type: Number, default: 0 },
  social: { type: Number, default: 0 },
  love: { type: Number, default: 0 },
  career: { type: Number, default: 0 },
  creative: { type: Number, default: 0 },
  travel: { type: Number, default: 0 },
  family: { type: Number, default: 0 },
  style: { type: Number, default: 0 },
  spiritual: { type: Number, default: 0 },

  // Identity
  date_of_birth: { type: Date, default: null },
  country: { type: String, default: null },
  gender: { type: String, default: null },
  identity_completed: { type: Boolean, default: false },

  // Additional fields
  additional: { type: String, default: null },
  channels: { type: [String], default: [] },

  // Dashboard metrics
  xp: { type: Number, default: 0 },
  maples: { type: Number, default: 0 },

  // Legacy subscriptions by coach ID
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coach' }],

  // Subscribed coaches with names and timestamps
  my_coaches: [{
    coach_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
    coach_name:  { type: String,                 required: true },
    subscribed_at: { type: Date,                 default: Date.now }
  }],

  avatar: { type: String, default: null },
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);
