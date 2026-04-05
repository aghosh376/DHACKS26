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
    currScore: Number,
    pastSentiments:[
      {
        score: Number,
      }
    ],
    email: String,
    officeLocation: String,
    imageUrl: String,
    
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
