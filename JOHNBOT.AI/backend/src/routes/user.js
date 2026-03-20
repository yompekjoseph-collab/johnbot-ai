import express from 'express';
import { requireAuth, attachUser, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, attachUser, (req, res) => {
  if (!req.currentUser) return res.status(404).json({ error: 'User not found' });
  res.json({ user: req.currentUser });
});

// Example admin-only endpoint
router.get('/admin/stats', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin statistics placeholder' });
});

export default router;
