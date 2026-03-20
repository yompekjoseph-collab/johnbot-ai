import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatbot: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: false },
    surname: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: null, trim: true },
    companyName: { type: String, default: null, trim: true },
    bookedAt: { type: Date, required: true, default: () => new Date() },
    status: { type: String, enum: ['new', 'contacted'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
