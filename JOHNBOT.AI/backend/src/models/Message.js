import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatbot: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true, index: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
