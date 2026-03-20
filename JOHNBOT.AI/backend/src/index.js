import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import widgetRoutes from './routes/widget.js';
import widgetScript from './routes/widgetScript.js';
import widgetEmbed from './routes/widgetEmbed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Basic security
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS - allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Passport for Google OAuth
app.use(passport.initialize());
import './utils/passport.js';

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Route-specific rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: { error: 'Too many auth requests, please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/widget', widgetRoutes);
app.use(widgetScript);
app.use(widgetEmbed);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { dbName: 'johnblex' })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
