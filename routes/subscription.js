import express  from 'express';
import jwt       from 'jsonwebtoken';
import axios     from 'axios';
import Subscription from '../models/Subscription.js';
import User         from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Front-end hits this right after onApprove.
 * Body: { subscriptionID, plan_id }
 */
router.post('/subscribed', authMiddleware, async (req, res) => {
  try {
    const { subscriptionID, plan_id } = req.body;
    if (!subscriptionID || !plan_id) {
      return res.status(400).json({ error: 'Missing subscriptionID or plan_id' });
    }

    // 1) OPTIONAL – verify with PayPal that it’s really ACTIVE
    const accessToken = await getPayPalToken();              // see helper below
    const subRes = await axios.get(
      `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionID}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const { status, next_billing_time, plan_id: returnedPlanId, subscriber } = subRes.data;

    // 2) Store or update in DB
    const sub = await Subscription.findOneAndUpdate(
      { subscriptionId: subscriptionID },
      {
        user:        req.user.id,          // comes from authMiddleware/JWT
        planId:      plan_id,
        status,
        nextBilling: next_billing_time ? new Date(next_billing_time) : null,
        payerId:     subscriber.payer_id
      },
      { upsert: true, new: true }
    );

    // 3) (Optional) mark user record as premium
    await User.findByIdAndUpdate(req.user.id, { hasActiveSub: true });

    res.json({ success: true, status });
  } catch (err) {
    console.error('Record subscription failed:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;

/* ───────── helper ───────── */
async function getPayPalToken () {
  const auth = Buffer.from(
    `${process.env.PP_CLIENT_ID}:${process.env.PP_SECRET}`
  ).toString('base64');

  const resp = await axios.post(
    'https://api-m.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    { headers:{ Authorization: `Basic ${auth}` } }
  );
  return resp.data.access_token;
}
