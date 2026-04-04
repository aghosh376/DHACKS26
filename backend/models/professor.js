import mongoose from 'mongoose';

const professorSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    email: String,
    officeLocation: String,
    imageUrl: String,
    
    // Aggregate Scores (0-100 scale)
    overallScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    setScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    rateMyProfScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    redditScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    capeEvalScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    // Reference arrays to reviews
    rateMyProfEvals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RateMyProf',
      },
    ],
    setEvals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SetEval',
      },
    ],
    capeEvals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CapeEval',
      },
    ],
    redditEvals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RedditReview',
      },
    ],

    // Stock Market Information
    stockPrice: {
      type: Number,
      default: 50,
    },
    stockPriceHistory: [
      {
        price: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sharesOutstanding: {
      type: Number,
      default: 1000,
    },

    // Quarterly Data
    quarterlyScores: [
      {
        quarter: String, // e.g., "F2023", "S2024"
        year: Number,
        score: Number,
        dataPoints: Number,
        date: Date,
      },
    ],

    // Metadata
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for common queries
professorSchema.index({ department: 1, overallScore: -1 });
professorSchema.index({ name: 'text', department: 'text' });

export default mongoose.model('Professor', professorSchema);
