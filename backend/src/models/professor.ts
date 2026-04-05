import { Schema, model, Document, Types } from 'mongoose';

export interface IProfessorDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  department: string;
  currScore?: number;
  rmpScore?: number;
  redditScore?: number;
  overallScore?: number;
  pastSentiments: Array<{ score: number }>;
  email?: string;
  officeLocation?: string;
  imageUrl?: string;
  stockPrice: number;
  stockPriceHistory: Array<{ price: number; date: Date }>;
  sharesOutstanding: number;
  quarterlyScores: Array<{
    quarter: string;
    year: number;
    score: number;
    dataPoints: number;
    date: Date;
  }>;
  lastUpdated: Date;
  createdAt: Date;
}

const professorSchema = new Schema<IProfessorDocument>(
  {
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
    rmpScore: Number,
    redditScore: Number,
    overallScore: Number,
    pastSentiments: [
      {
        score: Number,
      },
    ],
    email: String,
    officeLocation: String,
    imageUrl: String,
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
    quarterlyScores: [
      {
        quarter: String,
        year: Number,
        score: Number,
        dataPoints: Number,
        date: Date,
      },
    ],
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

professorSchema.index({ department: 1, currScore: -1 });
professorSchema.index({ name: 'text', department: 'text' });

export default model<IProfessorDocument>('Professor', professorSchema);
