import { Schema, model, Document, Types } from 'mongoose';

export interface IPriceHistory {
  price: number;
  date: Date;
}

export interface IStockDocument extends Document {
  _id: Types.ObjectId;
  professorId: Types.ObjectId;
  currentPrice: number;
  baselinePrice: number;
  high24h?: number;
  low24h?: number;
  high7d?: number;
  low7d?: number;
  high1m?: number;
  low1m?: number;
  high6m?: number;
  low6m?: number;
  priceHistory: IPriceHistory[];
  volume24h: number;
  volume7d: number;
  totalVolume: number;
  marketCap: number;
  sharesOutstanding: number;
  totalSharesBought: number;
  totalSharesSold: number;
  percentChange24h: number;
  percentChange7d: number;
  percentChange1m: number;
  percentChange6m: number;
  volatility: number;
  momentum: number;
  trend: 'bullish' | 'neutral' | 'bearish';
  lastUpdated: Date;
  createdAt: Date;
}

const stockSchema = new Schema<IStockDocument>(
  {
    professorId: {
      type: Schema.Types.ObjectId,
      ref: 'Professor',
      required: true,
      unique: true,
      index: true,
    },
    currentPrice: {
      type: Number,
      default: () => Math.random() * (55 - 45) + 45, // Random between $45-$55
      min: 0.01,
    },
    baselinePrice: {
      type: Number,
      default: () => Math.random() * (55 - 45) + 45, // Random between $45-$55
      min: 0.01,
    },
    high24h: Number,
    low24h: Number,
    high7d: Number,
    low7d: Number,
    high1m: Number,
    low1m: Number,
    high6m: Number,
    low6m: Number,
    priceHistory: [
      {
        price: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
          index: true,
        },
      },
    ],
    volume24h: {
      type: Number,
      default: 0,
    },
    volume7d: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
    },
    sharesOutstanding: {
      type: Number,
      default: 1000,
      min: 1,
    },
    totalSharesBought: {
      type: Number,
      default: 0,
    },
    totalSharesSold: {
      type: Number,
      default: 0,
    },
    percentChange24h: {
      type: Number,
      default: 0,
    },
    percentChange7d: {
      type: Number,
      default: 0,
    },
    percentChange1m: {
      type: Number,
      default: 0,
    },
    percentChange6m: {
      type: Number,
      default: 0,
    },
    volatility: {
      type: Number,
      default: 0,
    },
    momentum: {
      type: Number,
      default: 0,
    },
    trend: {
      type: String,
      enum: ['bullish', 'neutral', 'bearish'],
      default: 'neutral',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

stockSchema.index({ lastUpdated: -1, currentPrice: -1 });
stockSchema.index({ percentChange24h: -1 });
stockSchema.index({ trend: 1, currentPrice: -1 });

export default model<IStockDocument>('Stock', stockSchema);
