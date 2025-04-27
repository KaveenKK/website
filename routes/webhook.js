// routes/webhook.js
import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

// Setup MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db('nevengi');
const coaches = db.collection('coaches');

router.post('/webhook', async (req, res) => {
  const secret = req.headers['tally-signature'];
  const expectedSecret = 'fec7eb8f-547a-45df-961a-b3a89d5f8534';

  if (secret !== expectedSecret) {
    return res.status(403).send('Forbidden');
  }

  const payload = req.body;
  const email = payload.data.fields.find(f => f.label === 'Email')?.value;
  const discordTag = payload.data.fields.find(f => f.label === 'Discord Tag')?.value;
  if (!email && !discordTag) {
    return res.status(400).send('Missing identity info');
  }

  const query = email
    ? { email: email.trim().toLowerCase() }
    : { discordTag: discordTag.trim() };
  const result = await coaches.updateOne(query, { $set: { application_completed: true } });

  if (result.matchedCount === 0) {
    return res.status(404).send('Coach not found');
  }

  res.status(200).send('Webhook processed');
});

export default router;
