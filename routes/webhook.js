// routes/webhook.js
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const secret = req.headers['tally-signature'];
  const expectedSecret = 'fec7eb8f-547a-45df-961a-b3a89d5f8534';
  if (secret !== expectedSecret) {
    return res.status(403).send('Forbidden');
  }

  const payload = req.body;
  // Extract Email or Discord Tag from the form fields
  const email = payload.data.fields.find(f => f.label === 'Email')?.value;
  const discordTag = payload.data.fields.find(f => f.label === 'Discord Tag')?.value;

  if (!email && !discordTag) {
    return res.status(400).send('Missing identity info');
  }

  try {
    // Use the raw MongoDB driver from Mongoose
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
      return res.status(404).send('Coach not found');
    }

    return res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
