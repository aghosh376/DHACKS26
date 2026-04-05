/**
 * One-time script: populate historicalrmpprices collection and sync professor/stock data.
 *
 * Run: npx tsx src/scripts/populateHistoricalPrices.ts
 *
 * Required env vars: MONGODB_URI, BROWSER_USE_KEY
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import HistoricalRMPPrice from '../models/historicalRMPPrice.js';
import Professor from '../models/professor.js';
import Stock from '../models/stock.js';
import { ratingToScore } from '../utils/scoreCalculation.js';
import { scrapeRMPHistorical } from './scraper.js';
import { buildStockHistory } from './stockPriceEngine.js';

async function run() {
  await connectDB();

  const key = process.env.BROWSER_USE_KEY;
  if (!key) throw new Error('BROWSER_USE_KEY not set in .env');

  console.log('Scraping RMP historical data...');
  const { reviews: raw, departments } = await scrapeRMPHistorical(key);
  const history = buildStockHistory(raw);

  console.log(`Processing ${Object.keys(history).length} professors...`);

  // Load all professors for name → ObjectId lookup
  const professors = await Professor.find({}, 'name _id').lean();
  const nameToId = new Map(professors.map((p) => [p.name.toLowerCase(), p._id]));

  for (const [profName, priceEntries] of Object.entries(history)) {
    if (!priceEntries || priceEntries.length === 0) continue;

    const profId = nameToId.get(profName.toLowerCase());
    const lastEntry = priceEntries[priceEntries.length - 1];
    const currentPrice = lastEntry.price;

    // 1. Save to HistoricalRMPPrice collection (before professor creation — profId may still be undefined here)
    await HistoricalRMPPrice.findOneAndUpdate(
      { professorName: profName },
      {
        $set: {
          professorName: profName,
          priceHistory: priceEntries,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    // Create Professor document if it doesn't exist yet
    let resolvedId = profId;
    if (!resolvedId) {
      const newProf = await Professor.create({
        name: profName,
        department: departments[profName] || 'Computer Science & Engineering',
        stockPrice: currentPrice,
        sharesOutstanding: 1000,
      });
      resolvedId = newProf._id;
      nameToId.set(profName.toLowerCase(), resolvedId);
      console.log(`  [new] Created Professor: ${profName}`);
    }

    // Compute rmpScore from average of all raw ratings
    const rawDateMap = raw[profName];
    let rmpScore: number | undefined;
    if (rawDateMap) {
      const allRatings = Object.values(rawDateMap).flat() as number[];
      if (allRatings.length > 0) {
        const avg = allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
        rmpScore = ratingToScore(avg);
      }
    }

    // 2. Update Professor: stockPrice, stockPriceHistory, rmpScore, currScore
    const stockPriceHistory = priceEntries.map((e) => ({
      price: e.price,
      date: new Date(e.date),
    }));

    await Professor.findByIdAndUpdate(resolvedId, {
      $set: {
        stockPrice: currentPrice,
        stockPriceHistory,
        ...(rmpScore != null && { rmpScore, currScore: rmpScore, overallScore: rmpScore }),
        lastUpdated: new Date(),
      },
    });

    // 3. Update or create Stock document
    const stockPriceHistoryDated = priceEntries.map((e) => ({
      price: e.price,
      date: new Date(e.date),
    }));

    // Link HistoricalRMPPrice to the resolved professor ID
    await HistoricalRMPPrice.findOneAndUpdate(
      { professorName: profName },
      { $set: { professorId: resolvedId } }
    );

    await Stock.findOneAndUpdate(
      { professorId: resolvedId },
      {
        $set: {
          currentPrice,
          baselinePrice: priceEntries[0]?.price ?? 50,
          priceHistory: stockPriceHistoryDated,
          marketCap: currentPrice * 1000,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`  ✓ ${profName}: $${currentPrice.toFixed(2)}${rmpScore != null ? ` | RMP score: ${rmpScore}` : ''}`);
  }

  console.log('\nPopulation complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
