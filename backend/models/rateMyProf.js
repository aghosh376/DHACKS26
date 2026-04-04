import mongoose from 'mongoose';

const rateMyProfSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor',
      required: true,
      index: true,
    },
    rmpId: {
      type: String,
      unique: true,
      sparse: true,
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    difficulty: Number,
    author: String,
    wouldTakeAgain: Boolean,
    helpfulCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('RateMyProf', rateMyProfSchema);
