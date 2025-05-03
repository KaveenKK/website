import mongoose from 'mongoose';

const coachReviewSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
  coach_name: { type: String, required: true },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const weeklyReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  data: { type: Object, default: {} }, // Store weekly data (e.g., stats, achievements)
  reviews: [coachReviewSchema], // Array of reviews from coaches
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('WeeklyReport', weeklyReportSchema); 