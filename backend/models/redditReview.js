import mongoose from 'mongoose';

const redditReviewSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor',
      required: true,
      index: true,
    },
    postId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: String,
    content: {
      type: String,
      required: true,
    },
    author: String,
    url: String,
    sentimentScore: {
      type: Number,
      default: 0, // -1 to 1 scale
    },
    sentimentLabel: {
      type: String,
      enum: ['negative', 'neutral', 'positive'],
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    comments: Number,
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

export default mongoose.model('RedditReview', redditReviewSchema);
