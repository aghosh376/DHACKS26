/**
 * Score weights: RMP 60%, Reddit 40%
 * (SET weight redistributed until CAPE scraper is implemented)
 */
const RMP_WEIGHT = 0.6;
const REDDIT_WEIGHT = 0.4;

/**
 * Calculate overall professor score from available sources.
 * Falls back gracefully when only one source is available.
 */
export function calculateOverallScore(rmpScore?: number, redditScore?: number): number {
  if (rmpScore != null && redditScore != null) {
    return Math.round(rmpScore * RMP_WEIGHT + redditScore * REDDIT_WEIGHT);
  }
  if (rmpScore != null) return Math.round(rmpScore);
  if (redditScore != null) return Math.round(redditScore);
  return 50; // neutral default
}

/**
 * Convert a 1–5 RMP rating to a 0–100 score.
 * Matches the formula used in scrapeRateMyProf.
 */
export function ratingToScore(rating: number): number {
  return Math.round(((rating - 1) / 4) * 100);
}

/**
 * Convert a 0–100 score back to a 1–5 RMP rating approximation.
 * Used to derive a synthetic "daily rating" from an overall score for applyDailyUpdate.
 */
export function scoreToRating(score: number): number {
  return (score / 100) * 4 + 1;
}
