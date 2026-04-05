import { IStockDocument } from '../models/stock.js';

export interface PriceHistory {
  price: number;
  date: Date;
}

export interface HighLow {
  high: number;
  low: number;
}

export interface StockStats {
  currentPrice: number;
  volatility: number;
  momentum: number;
  trend: 'bullish' | 'neutral' | 'bearish';
  percentChange24h: number;
  percentChange7d: number;
  percentChange1m: number;
  percentChange6m: number;
}

/**
 * Calculate price impact for a transaction
 */
export const calculateNewPrice = (
  quantity: number,
  currentPrice: number,
  sharesOutstanding: number,
  type: 'buy' | 'sell'
): number => {
  const volumePercentage = quantity / sharesOutstanding;
  const impactFactor = Math.min(0.05, Math.max(0.005, volumePercentage * 0.1));

  if (type === 'buy') {
    return currentPrice * (1 + impactFactor);
  } else if (type === 'sell') {
    return Math.max(0.01, currentPrice * (1 - impactFactor));
  }

  return currentPrice;
};

/**
 * Get price elasticity
 */
export const getPriceElasticity = (sharesOutstanding: number): number => {
  if (sharesOutstanding < 100) return 0.8;
  if (sharesOutstanding < 500) return 0.6;
  if (sharesOutstanding < 1000) return 0.4;
  return 0.3;
};

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (
  oldPrice: number,
  newPrice: number
): number => {
  if (oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

/**
 * Update price history
 */
export const updatePriceHistory = (
  priceHistory: PriceHistory[],
  newPrice: number,
  maxHistorySize: number = 1000
): PriceHistory[] => {
  const newEntry: PriceHistory = {
    price: newPrice,
    date: new Date(),
  };

  const updated = [...priceHistory, newEntry];

  if (updated.length > maxHistorySize) {
    return updated.slice(-maxHistorySize);
  }

  return updated;
};

/**
 * Calculate high/low prices for a time period
 */
export const calculateHighLow = (
  priceHistory: PriceHistory[],
  period: '24h' | '7d' | '1m' | '6m'
): HighLow => {
  if (priceHistory.length === 0) {
    return { high: 0, low: 0 };
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (period) {
    case '24h':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '6m':
      cutoffDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoffDate = new Date(0);
  }

  const relevantPrices = priceHistory
    .filter((entry) => new Date(entry.date) >= cutoffDate)
    .map((entry) => entry.price);

  if (relevantPrices.length === 0) {
    return { high: 0, low: 0 };
  }

  return {
    high: Math.max(...relevantPrices),
    low: Math.min(...relevantPrices),
  };
};

/**
 * Calculate market cap
 */
export const calculateMarketCap = (
  currentPrice: number,
  sharesOutstanding: number
): number => {
  return currentPrice * sharesOutstanding;
};

/**
 * Get price statistics for a stock
 */
export const calculateStockStats = (stock: IStockDocument): StockStats => {
  const priceHistory = stock.priceHistory || [];

  if (priceHistory.length < 2) {
    return {
      currentPrice: stock.currentPrice,
      volatility: 0,
      momentum: 0,
      trend: 'neutral',
      percentChange24h: stock.percentChange24h || 0,
      percentChange7d: stock.percentChange7d || 0,
      percentChange1m: stock.percentChange1m || 0,
      percentChange6m: stock.percentChange6m || 0,
    };
  }

  const calculateVolatility = (): number => {
    const returns: number[] = [];
    for (let i = 1; i < priceHistory.length; i++) {
      const currentPrice = priceHistory[i].price;
      const previousPrice = priceHistory[i - 1].price;
      const returnRate = (currentPrice - previousPrice) / previousPrice;
      returns.push(returnRate);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      returns.length;
    return Math.sqrt(variance) * 100;
  };

  const calculateMomentum = (): number => {
    if (priceHistory.length < 8) return 0;
    const recent = priceHistory[priceHistory.length - 1].price;
    const old = priceHistory[priceHistory.length - 8].price;
    return ((recent - old) / old) * 100;
  };

  const volatility = calculateVolatility();
  const momentum = calculateMomentum();

  return {
    currentPrice: stock.currentPrice,
    volatility: Math.round(volatility * 100) / 100,
    momentum: Math.round(momentum * 100) / 100,
    trend: momentum > 2 ? 'bullish' : momentum < -2 ? 'bearish' : 'neutral',
    percentChange24h: stock.percentChange24h || 0,
    percentChange7d: stock.percentChange7d || 0,
    percentChange1m: stock.percentChange1m || 0,
    percentChange6m: stock.percentChange6m || 0,
  };
};

/**
 * Apply random market entropy to stock price
 * Each call generates independent ±1-2% random movement
 * Simulates natural market volatility and speculation
 */
export const applyMarketEntropy = (
  currentPrice: number
): number => {
  // Generate unique random percentage between -2% and +2%
  // Each call gets fresh Math.random() for independence
  const randomPercent = (Math.random() - 0.5) * 4; // Range: -2 to +2
  const newPrice = currentPrice * (1 + randomPercent / 100);
  
  // Ensure price never goes below $0.01
  return Math.max(0.01, newPrice);
};

export default {
  calculateNewPrice,
  getPriceElasticity,
  calculatePercentChange,
  updatePriceHistory,
  calculateHighLow,
  calculateMarketCap,
  calculateStockStats,
  applyMarketEntropy,
};
