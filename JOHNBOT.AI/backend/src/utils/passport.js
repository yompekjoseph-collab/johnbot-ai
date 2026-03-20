import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error('Google account has no email'));
        }

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            googleId: profile.id,
            role: 'client',
            isVerified: true,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
