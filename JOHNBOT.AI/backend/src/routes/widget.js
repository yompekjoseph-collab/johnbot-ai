import express from 'express';
import validator from 'validator';
import Lead from '../models/Lead.js';
import Chatbot from '../models/Chatbot.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Widget endpoint: requires a valid client token
router.post('/lead', requireAuth, requireRole('client'), async (req, res, next) => {
  try {
    const { surname, firstName, email, phone, companyName, chatbotId } = req.body;

    if (!surname || !firstName || !email) {
      return res.status(400).json({ error: 'surname, firstName and email are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const chatbot = chatbotId ? await Chatbot.findOne({ _id: chatbotId, client: req.user.id }) : null;

    const lead = await Lead.create({
      client: req.user.id,
      chatbot: chatbot ? chatbot._id : undefined,
      surname: surname.trim(),
      firstName: firstName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      companyName: companyName ? companyName.trim() : null,
      bookedAt: new Date(),
      status: 'new',
    });

    res.status(201).json({ ok: true, lead });
  } catch (err) {
    next(err);
  }
});

export default router;
