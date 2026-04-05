import { Schema, model, Document, Types } from 'mongoose';

export interface ITransactionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  professorId: Types.ObjectId;
  type: 'buy' | 'sell';
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    professorId: {
      type: Schema.Types.ObjectId,
      ref: 'Professor',
      required: true,
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerShare: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model<ITransactionDocument>('Transaction', transactionSchema);
