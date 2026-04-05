/**
 * Populate professors, stocks, and historical RMP price data.
 *
 * Run from the backend/ directory:
 *   node src/scripts/populate.js
 *
 * Requires backend/.env with MONGODB_URI and BROWSER_USE_KEY.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { scrapeRMPHistorical } from './scraper.js';
import { buildStockHistory } from './stockPriceEngine.js';

// ── Inline schemas (mirrors the TypeScript models) ──────────────────────────

const professorSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  department: { type: String, required: true },
  currScore: Number,
  rmpScore: Number,
  redditScore: Number,
  overallScore: Number,
  pastSentiments: [{ score: Number }],
  email: String,
  officeLocation: String,
  imageUrl: String,
  stockPrice: { type: Number, default: 50 },
  stockPriceHistory: [{ price: Number, date: { type: Date, default: Date.now } }],
  sharesOutstanding: { type: Number, default: 1000 },
  quarterlyScores: [{ quarter: String, year: Number, score: Number, dataPoints: Number, date: Date }],
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const stockSchema = new mongoose.Schema({
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true, unique: true, index: true },
  currentPrice: { type: Number, default: 50, min: 0.01 },
  baselinePrice: { type: Number, default: 50 },
  priceHistory: [{ price: { type: Number, required: true }, date: { type: Date, default: Date.now } }],
  volume24h: { type: Number, default: 0 },
  volume7d: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  marketCap: { type: Number, default: 0 },
  sharesOutstanding: { type: Number, default: 1000 },
  totalSharesBought: { type: Number, default: 0 },
  totalSharesSold: { type: Number, default: 0 },
  percentChange24h: { type: Number, default: 0 },
  percentChange7d: { type: Number, default: 0 },
  percentChange1m: { type: Number, default: 0 },
  percentChange6m: { type: Number, default: 0 },
  volatility: { type: Number, default: 0 },
  momentum: { type: Number, default: 0 },
  trend: { type: String, enum: ['bullish', 'neutral', 'bearish'], default: 'neutral' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const historicalRMPPriceSchema = new mongoose.Schema({
  professorName: { type: String, required: true, unique: true, index: true },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  priceHistory: [{ date: { type: String, required: true }, price: { type: Number, required: true } }],
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Use existing model if already registered (safe for re-runs)
const Professor = mongoose.models.Professor || mongoose.model('Professor', professorSchema);
const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
const HistoricalRMPPrice = mongoose.models.HistoricalRMPPrice || mongoose.model('HistoricalRMPPrice', historicalRMPPriceSchema);

// ── Helpers ──────────────────────────────────────────────────────────────────

function ratingToScore(rating) {
  return Math.round(((rating - 1) / 4) * 100);
}

// Departments that are valid for UCSD CSE faculty members on RMP.
// Professors on cse.ucsd.edu may appear under any of these on RMP.
// If the scraped department is not in this list it is almost certainly a wrong
// RMP match (different person, different university) — skip that professor.
const VALID_RMP_DEPARTMENTS = [
  'computer science',
  'engineering',
  'mathematics',
  'electrical engineering',
  'computer engineering',
  'data science',
  'cognitive science',
  'statistics',
  'information science',
];

function isValidRMPDepartment(dept) {
  if (!dept) return false;
  const lower = dept.toLowerCase();
  return VALID_RMP_DEPARTMENTS.some(d => lower.includes(d));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  const key = process.env.BROWSER_USE_KEY;

  if (!mongoUri) throw new Error('MONGODB_URI not set in .env');
  if (!key) throw new Error('BROWSER_USE_KEY not set in .env');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.\n');

  console.log('Scraping RMP historical data (CSE / Engineering / Mathematics)...');
  console.log('This runs 3 parallel agents and may take up to 30 minutes.\n');
  const { reviews: raw, departments } = await scrapeRMPHistorical(key);

  const profNames = Object.keys(raw);
  console.log(`Scraped ${profNames.length} professors with reviews.\n`);

  if (profNames.length === 0) {
    console.warn('No data returned — check BROWSER_USE_KEY and BrowserUse quota.');
    await mongoose.disconnect();
    return;
  }

  const history = buildStockHistory(raw);

  let created = 0;
  let updated = 0;

  for (const [profName, priceEntries] of Object.entries(history)) {
    if (!priceEntries || priceEntries.length === 0) continue;

    // Reject entries where the RMP department is non-STEM — almost certainly
    // a wrong-person match (e.g. a Psychology prof with the same name).
    const dept = departments[profName];
    if (dept && !isValidRMPDepartment(dept)) {
      console.log(`  [skip]    ${profName} — unexpected RMP department "${dept}", likely wrong match`);
      continue;
    }

    const currentPrice = priceEntries[priceEntries.length - 1].price;

    // Compute rmpScore from all raw ratings for this professor
    const allRatings = Object.values(raw[profName]).flat();
    const avgRating = allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
    const rmpScore = ratingToScore(avgRating);

    const stockPriceHistory = priceEntries.map(e => ({
      price: e.price,
      date: new Date(e.date),
    }));

    // Upsert professor
    let professor = await Professor.findOne({ name: { $regex: new RegExp(`^${escapeRegex(profName)}$`, 'i') } });

    if (!professor) {
      professor = await Professor.create({
        name: profName,
        department: departments[profName] || 'Computer Science & Engineering',
        stockPrice: currentPrice,
        stockPriceHistory,
        rmpScore,
        currScore: rmpScore,
        overallScore: rmpScore,
        sharesOutstanding: 1000,
        lastUpdated: new Date(),
      });
      created++;
      console.log(`  [new]     ${profName} — $${currentPrice.toFixed(2)} | RMP: ${rmpScore}`);
    } else {
      await Professor.findByIdAndUpdate(professor._id, {
        $set: {
          stockPrice: currentPrice,
          stockPriceHistory,
          rmpScore,
          currScore: rmpScore,
          overallScore: rmpScore,
          lastUpdated: new Date(),
        },
      });
      updated++;
      console.log(`  [updated] ${profName} — $${currentPrice.toFixed(2)} | RMP: ${rmpScore}`);
    }

    // Upsert stock
    await Stock.findOneAndUpdate(
      { professorId: professor._id },
      {
        $set: {
          currentPrice,
          baselinePrice: priceEntries[0]?.price ?? 50,
          priceHistory: stockPriceHistory,
          marketCap: currentPrice * 1000,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    // Upsert historical RMP price record
    await HistoricalRMPPrice.findOneAndUpdate(
      { professorName: profName },
      {
        $set: {
          professorName: profName,
          professorId: professor._id,
          priceHistory: priceEntries,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
