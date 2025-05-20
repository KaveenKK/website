import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  discord_id: { type: String, unique: true, sparse: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
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
  level: { type: Number, default: 1 },
  claimed_new_user_xp: { type: Boolean, default: false },

  // Legacy subscriptions by coach ID
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coach' }],

  // Subscribed coaches with names and timestamps
  my_coaches: [{
    coach_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
    coach_name:  { type: String,                 required: true },
    subscribed_at: { type: Date,                 default: Date.now }
  }],

  avatar: { type: String, default: null },
  energy: { type: Number, default: 0 },
  allowHouseInvites: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Add pre-save hook to update level based on XP
userSchema.pre('save', function(next) {
  if (typeof this.xp === 'number') {
    const oldLevel = this.level || 1;
    const newLevel = Math.floor(this.xp / 100) + 1;
    if (newLevel !== oldLevel) {
      this._levelUp = { oldLevel, newLevel };
    }
    this.level = newLevel;
  }
  next();
});

export default mongoose.model("User", userSchema);
