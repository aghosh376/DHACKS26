import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor',
      required: true,
      unique: true,
      index: true,
    },
    currentPrice: {
      type: Number,
      default: 50,
    },
    baslinePrice: {
      type: Number,
      default: 50,
    },
    high7d: Number,
    low7d: Number,
    high1m: Number,
    low1m: Number,
    high6m: Number,
    low6m: Number,
    priceHistory: [
      {
        price: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    volume: {
      type: Number,
      default: 0,
    },
    marketCap: Number,
    sharesOutstanding: {
      type: Number,
      default: 1000,
    },
    percentChange24h: Number,
    percentChange7d: Number,
    percentChange1m: Number,
    percentChange6m: Number,
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

export default mongoose.model('Stock', stockSchema);
