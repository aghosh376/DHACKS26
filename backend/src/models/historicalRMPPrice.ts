import { Schema, model, Document, Types } from 'mongoose';

export interface IPriceEntry {
  date: string;  // "YYYY-MM-DD"
  price: number;
}

export interface IHistoricalRMPPriceDocument extends Document {
  _id: Types.ObjectId;
  professorName: string;
  professorId?: Types.ObjectId;
  priceHistory: IPriceEntry[];
  lastUpdated: Date;
}

const historicalRMPPriceSchema = new Schema<IHistoricalRMPPriceDocument>(
  {
    professorName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    professorId: {
      type: Schema.Types.ObjectId,
      ref: 'Professor',
    },
    priceHistory: [
      {
        date: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model<IHistoricalRMPPriceDocument>('HistoricalRMPPrice', historicalRMPPriceSchema);
