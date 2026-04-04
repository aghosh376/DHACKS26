import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Authentication
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

    // UCSD Information
    ucsdId: String,
    graduationYear: Number,

    // Virtual Currency
    balance: {
      type: Number,
      default: 10000, // Starting balance in "Kosla Currency"
      min: 0,
    },

    // Portfolio
    portfolioValue: {
      type: Number,
      default: 10000,
    },
    stocksOwned: [
      {
        professorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Professor',
        },
        shares: {
          type: Number,
          default: 0,
        },
        averageBuyPrice: Number,
        totalInvested: Number,
        currentValue: Number,
      },
    ],

    // Department Investments
    departmentInvestments: [
      {
        department: String,
        totalInvested: Number,
        currentValue: Number,
      },
    ],

    // Transaction History
    transactionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],

    // Watchlist
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professor',
      },
    ],

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
