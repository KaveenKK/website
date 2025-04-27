// models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId:{ type: String, required: true, unique: true }, // PXP… or I-…
  planId:        { type: String, required: true },               // P-31V669…
  status:        { type: String, default: 'APPROVAL_PENDING' },  // ACTIVE, CANCELLED, etc.
  nextBilling:   { type: Date },
  payerId:       { type: String },                               // PayPal "payer_id"
  createdAt:     { type: Date, default: Date.now }
});

export default mongoose.model('Subscription', subscriptionSchema);
