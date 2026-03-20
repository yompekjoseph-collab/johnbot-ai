import express from 'express';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Chatbot from '../models/Chatbot.js';
import Lead from '../models/Lead.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { signJwt } from '../utils/jwt.js';

const router = express.Router();

const widgetTokenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many widget token requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});

// All admin routes require authenticated admin user
router.use(requireAuth);
router.use(requireRole('admin'));

// List all users (admin management)
router.get('/users', async (req, res, next) => {
  try {
    const {
      q,
      role,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      order = 'desc',
      createdAfter,
      createdBefore,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {};
    if (role) filter.role = role;
    if (q) filter.email = { $regex: q, $options: 'i' };

    if (createdAfter) {
      const d = new Date(createdAfter);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { ...filter.createdAt, $gte: d };
    }
    if (createdBefore) {
      const d = new Date(createdBefore);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { ...filter.createdAt, $lte: d };
    }

    const allowedSortFields = ['createdAt', 'email', 'role'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('email role isVerified createdAt')
      .sort({ [sortField]: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ meta: { total, page: pageNum, limit: limitNum }, users });
  } catch (err) {
    next(err);
  }
});

// Update a user (admin management)
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role, isVerified } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const update = {};
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      update.email = validator.normalizeEmail(email);
      const other = await User.findOne({ email: update.email, _id: { $ne: id } });
      if (other) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    if (role) {
      if (!['admin', 'client'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      if (existingUser.role === 'admin' && role === 'client') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(403).json({ error: 'Cannot demote the last admin' });
        }
      }

      update.role = role;
    }

    if (typeof isVerified === 'boolean') {
      update.isVerified = isVerified;
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('email role isVerified createdAt');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Delete a user (admin management)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (String(user._id) === String(req.user.id)) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last admin' });
      }
    }

    if (user.role === 'client') {
      await Chatbot.deleteMany({ client: user._id });
      await Lead.deleteMany({ client: user._id });
    }

    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Create a new client user (admin only)
router.post('/clients', async (req, res, next) => {
  try {
    const { email, companyName } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const normalized = validator.normalizeEmail(email);
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      email: normalized,
      role: 'client',
      isVerified: true,
    });

    res.status(201).json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// List clients (supports pagination + filtering)
router.get('/clients', async (req, res, next) => {
  try {
    const { q, page = '1', limit = '20', sortBy = 'createdAt', order = 'desc', createdAfter, createdBefore } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = { role: 'client' };
    if (q) filter.email = { $regex: q, $options: 'i' };

    if (createdAfter) {
      const d = new Date(createdAfter);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { ...filter.createdAt, $gte: d };
    }
    if (createdBefore) {
      const d = new Date(createdBefore);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { ...filter.createdAt, $lte: d };
    }

    const sortField = ['createdAt', 'email'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await User.countDocuments(filter);
    const clients = await User.find(filter)
      .select('email role createdAt')
      .sort({ [sortField]: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ meta: { total, page: pageNum, limit: limitNum }, clients });
  } catch (err) {
    next(err);
  }
});

// Update a client (email, role, verified)
router.patch('/clients/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role, isVerified } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid client id' });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const update = {};
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      update.email = validator.normalizeEmail(email);
      const other = await User.findOne({ email: update.email, _id: { $ne: id } });
      if (other) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    if (role) {
      if (!['admin', 'client'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      if (existingUser.role === 'admin' && role === 'client') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(403).json({ error: 'Cannot demote the last admin' });
        }
      }

      update.role = role;
    }

    if (typeof isVerified === 'boolean') {
      update.isVerified = isVerified;
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('email role isVerified createdAt');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Delete a user (client or admin) and related data
router.delete('/clients/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self deletion
    if (String(user._id) === String(req.user.id)) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    // Prevent removing the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last admin' });
      }
    }

    // Remove client-related data
    if (user.role === 'client') {
      await Chatbot.deleteMany({ client: user._id });
      await Lead.deleteMany({ client: user._id });
    }

    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Create chatbot for a client
router.post('/chatbots', async (req, res, next) => {
  try {
    const { clientId, name, systemPrompt } = req.body;
    if (!clientId || !name) {
      return res.status(400).json({ error: 'clientId and name are required' });
    }

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({ error: 'Client not found' });
    }

    const chatbot = await Chatbot.create({
      client: client._id,
      name: name.trim(),
      systemPrompt: systemPrompt || '',
    });

    res.status(201).json({ chatbot });
  } catch (err) {
    next(err);
  }
});

// List chatbots (supports pagination + filtering)
router.get('/chatbots', async (req, res, next) => {
  try {
    const { clientId, q, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {};
    if (clientId) {
      if (!mongoose.isValidObjectId(clientId)) {
        return res.status(400).json({ error: 'Invalid clientId' });
      }
      filter.client = clientId;
    }
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    const total = await Chatbot.countDocuments(filter);
    const chatbots = await Chatbot.find(filter)
      .populate('client', 'email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ meta: { total, page: pageNum, limit: limitNum }, chatbots });
  } catch (err) {
    next(err);
  }
});

// Update a chatbot
router.patch('/chatbots/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, systemPrompt, isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid chatbot id' });
    }

    const update = {};
    if (typeof name === 'string') update.name = name.trim();
    if (typeof systemPrompt === 'string') update.systemPrompt = systemPrompt;
    if (typeof isActive === 'boolean') update.isActive = isActive;

    const chatbot = await Chatbot.findByIdAndUpdate(id, update, { new: true });
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    res.json({ chatbot });
  } catch (err) {
    next(err);
  }
});

// Delete a chatbot and its leads
router.delete('/chatbots/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid chatbot id' });
    }

    const chatbot = await Chatbot.findById(id);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    await Lead.deleteMany({ chatbot: chatbot._id });
    await chatbot.deleteOne();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// View all leads (admin, supports pagination + filtering)
router.get('/leads', async (req, res, next) => {
  try {
    const { clientId, status, q, page = '1', limit = '20', sortBy = 'createdAt', order = 'desc', createdAfter, createdBefore } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {};
    if (clientId) {
      if (!mongoose.isValidObjectId(clientId)) {
        return res.status(400).json({ error: 'Invalid clientId' });
      }
      filter.client = clientId;
    }
    if (status) filter.status = status;
    if (q) {
      const regex = { $regex: q, $options: 'i' };
      filter.$or = [{ email: regex }, { surname: regex }, { firstName: regex }];
    }

    if (createdAfter) {
      const d = new Date(createdAfter);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { ...filter.createdAt, $gte: d };
    }
    if (createdBefore) {
      const d = new Date(createdBefore);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { ...filter.createdAt, $lte: d };
    }

    const sortField = ['createdAt', 'email', 'surname', 'firstName', 'status'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('client', 'email')
      .sort({ [sortField]: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ meta: { total, page: pageNum, limit: limitNum }, leads });
  } catch (err) {
    next(err);
  }
});

// Generate a short-lived widget token for a client (for embeddable script)
router.get('/widget-token', widgetTokenLimiter, async (req, res, next) => {
  try {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: 'clientId required' });
    if (!mongoose.isValidObjectId(clientId)) return res.status(400).json({ error: 'Invalid clientId' });

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({ error: 'Client not found' });
    }

    const token = signJwt({ clientId: client._id, role: 'widget' }, { expiresIn: '2d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
