import mongoose from "mongoose";

const decisionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  aiResponse: { type: String, required: true },
  followUpQuestions: { type: [String], default: [] },
}, {
  timestamps: true
});

export default mongoose.model("DecisionLog", decisionLogSchema); 