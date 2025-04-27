import express from 'express';
import mongoose from 'mongoose';
import { createHmac } from 'crypto';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  // Tally signature verification
  const signingSecret = process.env.TALLY_SIGNING_SECRET;
  const receivedSignature = req.headers['tally-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = createHmac('sha256', signingSecret)
    .update(payload)
    .digest('base64');

  if (!receivedSignature || receivedSignature !== expectedSignature) {
    console.error('⚠️ Invalid signature', { receivedSignature, expectedSignature });
    return res.status(403).send('Forbidden');
  }

  // Extract form fields
  const fields = req.body.data?.fields || [];
  const emailField = fields.find(f => f.label && /email/i.test(f.label));
  const discordField = fields.find(f => f.label && /discord/i.test(f.label));
  const email = emailField?.value;
  const discordTag = discordField?.value;

  if (!email && !discordTag) {
    console.error('⚠️ Missing identity info in webhook payload');
    return res.status(400).send('Missing identity info');
  }

  try {
    // Use Mongoose's underlying MongoDB driver
    const db = mongoose.connection.db;
    const coaches = db.collection('coaches');

    const query = email
      ? { email: email.trim().toLowerCase() }
      : { discordTag: discordTag.trim() };

    const result = await coaches.updateOne(
      query,
      { $set: { application_completed: true } }
    );

    if (result.matchedCount === 0) {
      console.warn('⚠️ No coach document matched for update', query);
      return res.status(404).send('Coach not found');
    }

    console.log('✅ Webhook processed, application_completed set to true for', query);
    return res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
