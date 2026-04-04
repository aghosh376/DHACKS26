# Score Calculation Utility
# Implements the aggregation formula: Score = ((W_SET * R_SET) + (W_RMP * R_RMP) + (W_Reddit * S_sentiment)) / W_total

export const SCORE_WEIGHTS = {
  SET: 0.5,      // Official (50%)
  RMP: 0.3,      // RateMyProfessor (30%)
  REDDIT: 0.2,   // Reddit Sentiment (20%)
};

export const TOTAL_WEIGHT = SCORE_WEIGHTS.SET + SCORE_WEIGHTS.RMP + SCORE_WEIGHTS.REDDIT;

/**
 * Calculate aggregate score for a professor
 * All component scores should be on 0-100 scale
 */
export const calculateAggregateScore = (setScore, rmpScore, redditScore) => {
  const weighted =
    (SCORE_WEIGHTS.SET * setScore) +
    (SCORE_WEIGHTS.RMP * rmpScore) +
    (SCORE_WEIGHTS.REDDIT * redditScore);

  return Math.round(weighted / TOTAL_WEIGHT);
};

/**
 * Normalize sentiment score from -1 to 1 scale to 0-100 scale
 */
export const normalizeSentiment = (sentimentScore) => {
  const normalized = ((sentimentScore + 1) / 2) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

/**
 * Normalize 1-5 rating to 0-100 scale
 */
export const normalizeRating = (rating) => {
  return Math.round((rating / 5) * 100);
};

/**
 * Calculate stock price adjustment based on score
 * Stock prices trend toward their aggregate score over time
 */
export const calculateStockPriceAdjustment = (currentPrice, targetScore, maxDailyChange = 2) => {
  if (currentPrice < targetScore) {
    return Math.min(currentPrice + maxDailyChange, targetScore);
  } else if (currentPrice > targetScore) {
    return Math.max(currentPrice - maxDailyChange, targetScore);
  }
  return currentPrice;
};

/**
 * Calculate percent change between two prices
 */
export const calculatePercentChange = (oldPrice, newPrice) => {
  if (oldPrice === 0) return 0;
  return Math.round(((newPrice - oldPrice) / oldPrice) * 100 * 100) / 100; // 2 decimal places
};
