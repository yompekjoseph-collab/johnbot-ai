import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { signJwt } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/email.js';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function buildRedirectUrl(token, role) {
  const redirectPath = role === 'admin' ? '/admin' : '/dashboard';
  return `${FRONTEND_URL}/auth/success?token=${encodeURIComponent(token)}&role=${encodeURIComponent(
    role
  )}&next=${encodeURIComponent(redirectPath)}`;
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('johnblex_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    const user = req.user;
    const token = signJwt({ id: user._id, role: user.role });
    setAuthCookie(res, token);
    const url = buildRedirectUrl(token, user.role);
    res.redirect(url);
  }
);

// Email sign up start: send OTP
router.post('/signup/email', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const normalized = validator.normalizeEmail(email);
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email: normalized, code, expiresAt, attempts: 0 });
    await sendOtpEmail(normalized, code);

    res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
});

// Verify OTP
router.post('/signup/verify', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !validator.isEmail(email) || !code) {
      return res.status(400).json({ error: 'Email and code required' });
    }

    const normalized = validator.normalizeEmail(email);
    const record = await Otp.findOne({ email: normalized }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ error: 'No OTP request found' });
    }

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (record.attempts >= 5) {
      await record.deleteOne();
      return res.status(429).json({ error: 'Too many attempts' });
    }

    if (record.code !== String(code).trim()) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: 'Invalid code' });
    }

    // Keep OTP record for a short time so password set can verify
    res.json({ ok: true, message: 'Verified' });
  } catch (err) {
    next(err);
  }
});

// Complete signup with password
router.post('/signup/password', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !validator.isEmail(email) || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const normalized = validator.normalizeEmail(email);
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const record = await Otp.findOne({ email: normalized }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ error: 'OTP step required' });
    }

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Password policy
    const passwordRules = [
      { regex: /.{8,}/, message: 'Minimum 8 characters' },
      { regex: /[A-Z]/, message: 'One uppercase letter' },
      { regex: /[a-z]/, message: 'One lowercase letter' },
      { regex: /[0-9]/, message: 'One number' },
      { regex: /[@$&*+=_\-?/'"\\|{}]/, message: 'One special character' },
    ];

    const failed = passwordRules.filter((r) => !r.regex.test(password));
    if (failed.length > 0) {
      return res.status(400).json({ error: 'Password does not meet requirements' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalized,
      passwordHash: hash,
      role: 'client',
      isVerified: true,
    });

    await record.deleteOne();

    const token = signJwt({ id: user._id, role: user.role });
    setAuthCookie(res, token);
    res.json({ ok: true, token, role: user.role });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const normalized = validator.normalizeEmail(email);
    const user = await User.findOne({ email: normalized });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Password login not available for this account' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = signJwt({ id: user._id, role: user.role });
    setAuthCookie(res, token);
    res.json({ ok: true, token, role: user.role });
  } catch (err) {
    next(err);
  }
});

export default router;
