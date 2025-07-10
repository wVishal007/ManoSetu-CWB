import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
  },
  moodValue: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  factors: [{
    type: String,
    enum: ['sleep', 'exercise', 'social', 'work', 'weather', 'health', 'other'],
  }],
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure one mood entry per user per day
moodSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Mood', moodSchema);