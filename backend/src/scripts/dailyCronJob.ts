/**
 * Daily cron job — runs at 12:00 AM every day.
 *
 * Pipeline:
 *   1. Scrape RMP (CSE professors) → update rmpScore + stock price
 *   2. Scrape r/UCSD last 24 hrs → evaluate with Gemini → update redditScore
 *   3. Recalculate overallScore / currScore for all professors
 *   4. Recalculate stock stats (percentChanges, high/low, volatility, momentum, trend)
 *
 * Required env vars: BROWSER_USE_KEY, GEMINI_API_KEY
 */

import cron from 'node-cron';
import Professor from '../models/professor.js';
import Stock from '../models/stock.js';
import HistoricalRMPPrice from '../models/historicalRMPPrice.js';
import { calculateOverallScore, scoreToRating } from '../utils/scoreCalculation.js';
import {
  calculateHighLow,
  calculateMarketCap,
  calculatePercentChange,
  calculateStockStats,
} from '../utils/marketEngine.js';
import { scrapeRateMyProf, scrapeDayBackReddit } from './scraper.js';
import { evaluateProfessorsFromReddit } from './redditEvaluator.js';
import { applyDailyUpdate } from './stockPriceEngine.js';

async function runDailyUpdate() {
  const key = process.env.BROWSER_USE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('[cron] BROWSER_USE_KEY not set — aborting daily update');
    return;
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  console.log(`[cron] Daily update started for ${today}`);

  // ── Step 1: RMP scrape ──────────────────────────────────────────────────────
  let rmpScores: Record<string, number> = {};
  try {
    console.log('[cron] Scraping RateMyProfessors...');
    rmpScores = await scrapeRateMyProf(key);
    console.log(`[cron] Got RMP scores for ${Object.keys(rmpScores).length} professors`);
  } catch (err) {
    console.error('[cron] RMP scrape failed:', err);
  }

  // Update rmpScore and stock price for each professor
  for (const [profName, newRmpScore] of Object.entries(rmpScores)) {
    try {
      const professor = await Professor.findOne({
        name: { $regex: new RegExp(`^${profName}$`, 'i') },
      });
      if (!professor) continue;

      const syntheticRating = scoreToRating(newRmpScore);
      const stock = await Stock.findOne({ professorId: professor._id });
      const currentPrice = stock?.currentPrice ?? professor.stockPrice ?? 50;
      const newPrice = applyDailyUpdate(currentPrice, [syntheticRating]);

      // Update professor
      professor.rmpScore = newRmpScore;
      professor.stockPrice = newPrice;
      professor.stockPriceHistory.push({ price: newPrice, date: new Date() });
      professor.lastUpdated = new Date();
      await professor.save();

      // Update historical RMP price record
      await HistoricalRMPPrice.findOneAndUpdate(
        { professorName: profName },
        {
          $push: { priceHistory: { date: today, price: newPrice } },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true }
      );

      // Update stock
      if (stock) {
        const oldPrice = stock.currentPrice;
        stock.currentPrice = newPrice;
        stock.priceHistory.push({ price: newPrice, date: new Date() });
        stock.marketCap = calculateMarketCap(newPrice, stock.sharesOutstanding);
        stock.percentChange24h = calculatePercentChange(oldPrice, newPrice);
        stock.lastUpdated = new Date();
        await stock.save();
      }
    } catch (err) {
      console.error(`[cron] Failed to update professor "${profName}":`, err);
    }
  }

  // ── Step 2: Reddit scrape ───────────────────────────────────────────────────
  let redditEvals: Record<string, { score: number }> = {};
  if (geminiKey) {
    try {
      console.log('[cron] Scraping r/UCSD last 24 hours...');
      const redditOutput = await scrapeDayBackReddit(key);
      console.log(`[cron] Got Reddit comments for ${Object.keys(redditOutput).length} professors`);

      redditEvals = await evaluateProfessorsFromReddit(redditOutput, geminiKey);
      console.log(`[cron] Evaluated ${Object.keys(redditEvals).length} professors from Reddit`);

      for (const [profName, evalResult] of Object.entries(redditEvals)) {
        await Professor.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${profName}$`, 'i') } },
          { $set: { redditScore: evalResult.score, lastUpdated: new Date() } }
        );
      }
    } catch (err) {
      console.error('[cron] Reddit evaluation failed:', err);
    }
  } else {
    console.warn('[cron] GEMINI_API_KEY not set — skipping Reddit evaluation');
  }

  // ── Step 3: Recalculate overallScore / currScore ────────────────────────────
  try {
    const professors = await Professor.find({
      $or: [{ rmpScore: { $exists: true } }, { redditScore: { $exists: true } }],
    });

    for (const professor of professors) {
      const newOverall = calculateOverallScore(professor.rmpScore, professor.redditScore);
      professor.overallScore = newOverall;
      professor.currScore = newOverall;
      await professor.save();
    }
    console.log(`[cron] Updated overallScore for ${professors.length} professors`);
  } catch (err) {
    console.error('[cron] overallScore recalculation failed:', err);
  }

  // ── Step 4: Recalculate stock stats ────────────────────────────────────────
  try {
    const stocks = await Stock.find();
    for (const stock of stocks) {
      const stats = calculateStockStats(stock);
      const hl24h = calculateHighLow(stock.priceHistory, '24h');
      const hl7d = calculateHighLow(stock.priceHistory, '7d');
      const hl1m = calculateHighLow(stock.priceHistory, '1m');
      const hl6m = calculateHighLow(stock.priceHistory, '6m');

      const history = stock.priceHistory;
      const now = Date.now();
      const priceAt = (msBack: number) => {
        const cutoff = now - msBack;
        const entry = [...history].reverse().find((e) => new Date(e.date).getTime() <= cutoff);
        return entry?.price ?? history[0]?.price ?? stock.currentPrice;
      };

      stock.volatility = stats.volatility;
      stock.momentum = stats.momentum;
      stock.trend = stats.trend;
      stock.high24h = hl24h.high;
      stock.low24h = hl24h.low;
      stock.high7d = hl7d.high;
      stock.low7d = hl7d.low;
      stock.high1m = hl1m.high;
      stock.low1m = hl1m.low;
      stock.high6m = hl6m.high;
      stock.low6m = hl6m.low;
      stock.percentChange7d = calculatePercentChange(priceAt(7 * 86400000), stock.currentPrice);
      stock.percentChange1m = calculatePercentChange(priceAt(30 * 86400000), stock.currentPrice);
      stock.percentChange6m = calculatePercentChange(priceAt(180 * 86400000), stock.currentPrice);
      stock.lastUpdated = new Date();
      await stock.save();
    }
    console.log(`[cron] Updated stats for ${stocks.length} stocks`);
  } catch (err) {
    console.error('[cron] Stock stats update failed:', err);
  }

  console.log(`[cron] Daily update complete for ${today}`);
}

export function startDailyCron() {
  // Run at 12:00 AM every day
  cron.schedule('0 0 * * *', () => {
    runDailyUpdate().catch((err) => console.error('[cron] Unhandled error:', err));
  }, { timezone: 'America/Los_Angeles' });

  console.log('[cron] Daily scrape scheduled for 12:00 AM PT');
}
