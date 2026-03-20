import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String, default: null },
    passwordHash: { type: String, default: null },
    role: {
      type: String,
      enum: ['admin', 'client'],
      default: 'client',
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
