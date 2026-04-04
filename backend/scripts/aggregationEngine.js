// Aggregation Engine - Runs daily to update professor scores
// Schedule: 12 AM (configurable via .env)

import Professor from '../models/professor.js';
import { calculateAggregateScore, normalizeRating, normalizeSentiment } from '../utils/scoreCalculation.js';

/**
 * Main aggregation pipeline
 * Called daily to recalculate all professor scores
 */
export const runAggregationEngine = async () => {
  try {
    console.log('Starting aggregation engine...');
    
    const professors = await Professor.find().populate([
      'setEvals',
      'capeEvals',
      'rateMyProfEvals',
      'redditEvals'
    ]);

    for (const professor of professors) {
      // Calculate scores from each source
      const setScore = calculateSetScore(professor.setEvals);
      const capeScore = calculateCapeScore(professor.capeEvals);
      const rmpScore = calculateRMPScore(professor.rateMyProfEvals);
      const redditScore = calculateRedditScore(professor.redditEvals);

      // Average SET and CAPE for official score
      const officialScore = (setScore + capeScore) / 2;

      // Calculate aggregate using weighted formula
      const aggregateScore = calculateAggregateScore(
        officialScore,
        rmpScore,
        redditScore
      );

      // Update professor with new scores
      professor.setScore = setScore;
      professor.capeEvalScore = capeScore;
      professor.rateMyProfScore = rmpScore;
      professor.redditScore = redditScore;
      professor.overallScore = aggregateScore;
      professor.lastUpdated = new Date();

      await professor.save();
      console.log(`Updated ${professor.name}: ${aggregateScore}`);
    }

    console.log('Aggregation engine completed successfully');
    return true;
  } catch (error) {
    console.error('Aggregation engine error:', error);
    return false;
  }
};

/**
 * Calculate average score from SET evaluations
 */
const calculateSetScore = (setEvals) => {
  if (!setEvals || setEvals.length === 0) return 50;

  const totalScore = setEvals.reduce((sum, eval) => {
    const avgScore = Object.values(eval.scores || {}).reduce((a, b) => a + b, 0) / 
                    Object.keys(eval.scores || {}).length;
    return sum + avgScore;
  }, 0);

  return Math.round((totalScore / setEvals.length / 5) * 100); // Convert to 0-100
};

/**
 * Calculate average score from CAPE evaluations
 */
const calculateCapeScore = (capeEvals) => {
  if (!capeEvals || capeEvals.length === 0) return 50;

  const totalScore = capeEvals.reduce((sum, eval) => {
    const avgScore = Object.values(eval.scores || {}).reduce((a, b) => a + b, 0) / 
                     Object.keys(eval.scores || {}).length;
    return sum + avgScore;
  }, 0);

  return Math.round((totalScore / capeEvals.length / 5) * 100);
};

/**
 * Calculate average score from RateMyProfessor reviews
 */
const calculateRMPScore = (rmpEvals) => {
  if (!rmpEvals || rmpEvals.length === 0) return 50;

  const totalScore = rmpEvals.reduce((sum, eval) => {
    return sum + (eval.rating || 3); // Default to 3 if no rating
  }, 0);

  const avgRating = totalScore / rmpEvals.length;
  return normalizeRating(avgRating);
};

/**
 * Calculate sentiment score from Reddit reviews
 */
const calculateRedditScore = (redditEvals) => {
  if (!redditEvals || redditEvals.length === 0) return 50;

  const totalScore = redditEvals.reduce((sum, eval) => {
    return sum + (eval.sentimentScore || 0); // -1 to 1 scale
  }, 0);

  const avgSentiment = totalScore / redditEvals.length;
  return normalizeSentiment(avgSentiment);
};

/**
 * Calculate quarterly scores
 * For tracking professor performance over time
 */
export const calculateQuarterlyScores = async () => {
  try {
    const professors = await Professor.find();

    for (const professor of professors) {
      // Get current quarter
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      let quarter;
      if (month < 3) quarter = 'W';
      else if (month < 6) quarter = 'S';
      else if (month < 9) quarter = 'F';
      else quarter = 'SummerSpecial';

      const quarterCode = `${quarter}${year}`;

      // Add score to quarterlyScores array
      professor.quarterlyScores.push({
        quarter: quarterCode,
        year,
        score: professor.overallScore,
        dataPoints: professor.rateMyProfEvals.length + 
                   professor.redditEvals.length +
                   professor.setEvals.length,
        date: new Date(),
      });

      await professor.save();
    }

    return true;
  } catch (error) {
    console.error('Quarterly score calculation error:', error);
    return false;
  }
};
