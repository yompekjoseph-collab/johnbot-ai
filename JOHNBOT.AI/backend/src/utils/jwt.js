import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment');
}

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options });
}

export function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}
