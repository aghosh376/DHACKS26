/**
 * Reset script: clears professors, stocks, historicalrmpprices, and transactions.
 * Users keep their email/password/name but are reset to default balance and empty portfolio.
 *
 * Run from the backend/ directory:
 *   node src/scripts/reset.js
 *
 * Requires backend/.env with MONGODB_URI.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI not set in .env');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.\n');

  const db = mongoose.connection.db;

  // Drop market data collections entirely
  const toDrop = ['professors', 'stocks', 'historicalrmpprices', 'transactions'];
  for (const col of toDrop) {
    const exists = await db.listCollections({ name: col }).hasNext();
    if (exists) {
      await db.collection(col).drop();
      console.log(`  ✓ Dropped collection: ${col}`);
    } else {
      console.log(`  – Skipped (not found): ${col}`);
    }
  }

  // Reset users: keep email/password/name, restore defaults
  const result = await db.collection('users').updateMany({}, {
    $set: {
      balance: 10000,
      portfolioValue: 10000,
      totalInvested: 0,
      stocksOwned: [],
      departmentInvestments: [],
      transactionHistory: [],
      watchlist: [],
    },
  });
  console.log(`\n  ✓ Reset ${result.modifiedCount} user(s) to default portfolio state`);

  console.log('\nReset complete. Run populate script to repopulate professor/stock data.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
