import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
}, {
  timestamps: true,
});

export default mongoose.model('Chat', chatSchema);