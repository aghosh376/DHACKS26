import { Schema, model, Document, Types } from 'mongoose';

export interface IStockHolding {
  professorId: Types.ObjectId;
  shares: number;
  averageBuyPrice: number;
  totalInvested: number;
  currentValue: number;
  costBasis: number;
  gainLoss: number;
  percentReturn: number;
}

export interface IDepartmentInvestment {
  department: string;
  totalInvested: number;
  currentValue: number;
}

export interface IUserPortfolio {
  holdings: IStockHolding[];
  transactionHistory: Types.ObjectId[];
  watchlist: Types.ObjectId[];
}

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  ucsdId?: string;
  graduationYear?: number;
  balance: number;
  portfolioValue: number;
  totalInvested: number;
  stocksOwned: IStockHolding[];
  departmentInvestments: IDepartmentInvestment[];
  transactionHistory: Types.ObjectId[];
  watchlist: Types.ObjectId[];
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  lastLogin?: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: String,
    ucsdId: String,
    graduationYear: Number,
    balance: {
      type: Number,
      default: 10000,
      min: 0,
    },
    portfolioValue: {
      type: Number,
      default: 10000,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    stocksOwned: [
      {
        professorId: {
          type: Schema.Types.ObjectId,
          ref: 'Professor',
          required: true,
        },
        shares: {
          type: Number,
          default: 0,
          min: 0,
        },
        averageBuyPrice: {
          type: Number,
          default: 0,
        },
        totalInvested: {
          type: Number,
          default: 0,
        },
        currentValue: {
          type: Number,
          default: 0,
        },
        costBasis: {
          type: Number,
          default: 0,
        },
        gainLoss: {
          type: Number,
          default: 0,
        },
        percentReturn: {
          type: Number,
          default: 0,
        },
      },
    ],
    departmentInvestments: [
      {
        department: String,
        totalInvested: Number,
        currentValue: Number,
      },
    ],
    transactionHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    watchlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Professor',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

export default model<IUserDocument>('User', userSchema);
