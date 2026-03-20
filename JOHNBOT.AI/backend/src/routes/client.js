import express from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Client-only routes
router.use(requireAuth);
router.use(requireRole('client'));

// List leads for current client
router.get('/leads', async (req, res, next) => {
  try {
    const leads = await Lead.find({ client: req.user.id }).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    next(err);
  }
});

// Mark lead as contacted
router.post('/leads/:id/contacted', async (req, res, next) => {
  try {
    const leadId = req.params.id;
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ error: 'Invalid lead id' });
    }

    const lead = await Lead.findOne({ _id: leadId, client: req.user.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'contacted';
    await lead.save();
    res.json({ lead });
  } catch (err) {
    next(err);
  }
});

export default router;
