import { verifyJwt } from '../utils/jwt.js';
import User from '../models/User.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Support HTTP-only cookie token as well
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(^|; )johnblex_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[2]);
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const payload = verifyJwt(token);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

export function requireRoles(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

export async function attachUser(req, res, next) {
  if (!req.user) return next();
  const user = await User.findById(req.user.id).select('-passwordHash');
  req.currentUser = user;
  next();
}
