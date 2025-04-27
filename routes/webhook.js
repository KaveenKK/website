// routes/webhook.js

const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// Setup MongoDB connection (reuse if you already connected elsewhere)
const client = new MongoClient(process.env.MONGO_URI);
client.connect();
const db = client.db('nevengi'); // your database name
const coaches = db.collection('coaches');

router.post('/webhook', async (req, res) => {
  const secret = req.headers['tally-signature'];
  const expectedSecret = 'fec7eb8f-547a-45df-961a-b3a89d5f8534'; // from your Tally webhook settings

  if (secret !== expectedSecret) {
    console.log('❌ Invalid webhook secret');
    return res.status(403).send('Forbidden');
  }

  const payload = req.body;
  console.log('📥 Received Webhook', JSON.stringify(payload, null, 2));

  const email = payload.data.fields.find(f => f.label === 'Email')?.value;
  const discordTag = payload.data.fields.find(f => f.label === 'Discord Tag')?.value;

  if (!email && !discordTag) {
    console.log('⚠️ Email or Discord Tag missing in form submission');
    return res.status(400).send('Missing identity info');
  }

  try {
    const query = email
      ? { email: email.trim().toLowerCase() }
      : { discordTag: discordTag.trim() };

    const result = await coaches.updateOne(
      query,
      { $set: { application_completed: true } }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️ No coach found to update.');
      return res.status(404).send('Coach not found');
    }

    console.log('✅ Coach application marked as completed');
    return res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('Webhook error', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
