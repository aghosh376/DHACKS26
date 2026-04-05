/**
 * Each rating contributes (rating - 3.0) / 2.0 * 0.02 as a fraction of current price.
 * Max ±2% per review, stacked additively, capped at ±15% per day.
 */
function calcDailyDelta(ratings) {
  const total = ratings.reduce((sum, r) => sum + ((r - 3.0) / 2.0) * 0.02, 0);
  return Math.max(-0.15, Math.min(0.15, total));
}

/**
 * Builds a chronological price history for each professor starting at $50.
 *
 * @param {Object} rmpHistoricalOutput - Output of scrapeRMPHistorical:
 *   { "Prof Name": { "YYYY-MM-DD": [rating, ...] } }
 * @returns {{ [profName]: Array<{ date: string, price: number }> }}
 */
export function buildStockHistory(rmpHistoricalOutput) {
  const result = {};

  for (const [profName, dateMap] of Object.entries(rmpHistoricalOutput)) {
    const sortedDates = Object.keys(dateMap).sort();
    let price = 50;
    result[profName] = [];

    for (const date of sortedDates) {
      const delta = calcDailyDelta(dateMap[date]);
      price = Math.max(1, price * (1 + delta));
      result[profName].push({ date, price: Math.round(price * 100) / 100 });
    }
  }

  return result;
}

/**
 * Applies a single day's new RMP ratings to a professor's current stock price.
 * Used for daily 12am cron scrapes.
 *
 * @param {number} currentPrice - The professor's current stock price
 * @param {number[]} newRatings - Array of new RMP ratings (1.0–5.0) from today
 * @returns {number} Updated stock price
 */
export function applyDailyUpdate(currentPrice, newRatings) {
  if (!newRatings || newRatings.length === 0) return currentPrice;
  const delta = calcDailyDelta(newRatings);
  return Math.max(1, Math.round(currentPrice * (1 + delta) * 100) / 100);
}
