import { professors, type Professor } from "./professors";

export interface PricePoint {
  time: number;
  price: number;
}

export interface StockState {
  professorId: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  history: PricePoint[];
  volume: number;
  high: number;
  low: number;
  marketCap: number;
}

export interface Holding {
  professorId: string;
  shares: number;
  avgCost: number;
}

export interface Portfolio {
  cash: number;
  holdings: Holding[];
}

const INITIAL_CASH = 10000;
const BASE_PRICE_MULTIPLIER = 10;
const TOTAL_SHARES = 1000;

function sentimentToBasePrice(prof: Professor): number {
  return ((prof.sentiment / 100) * prof.rating * BASE_PRICE_MULTIPLIER);
}

function generateHistory(basePrice: number, points: number = 50): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * (0.7 + Math.random() * 0.3);
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const volatility = 0.02 + Math.random() * 0.03;
    const drift = (basePrice - price) * 0.01;
    price = Math.max(1, price * (1 + drift + (Math.random() - 0.48) * volatility));
    history.push({ time: now - i * 60000, price: Math.round(price * 100) / 100 });
  }
  return history;
}

export function initializeStocks(): Map<string, StockState> {
  const stocks = new Map<string, StockState>();
  professors.forEach(prof => {
    const basePrice = sentimentToBasePrice(prof);
    const history = generateHistory(basePrice);
    const currentPrice = history[history.length - 1].price;
    const previousPrice = history[history.length - 2].price;
    stocks.set(prof.id, {
      professorId: prof.id,
      price: currentPrice,
      previousPrice,
      change: Math.round((currentPrice - previousPrice) * 100) / 100,
      changePercent: Math.round(((currentPrice - previousPrice) / previousPrice) * 10000) / 100,
      history,
      volume: Math.floor(Math.random() * 5000) + 500,
      high: Math.max(...history.map(h => h.price)),
      low: Math.min(...history.map(h => h.price)),
      marketCap: Math.round(currentPrice * TOTAL_SHARES),
    });
  });
  return stocks;
}

export function tickPrices(stocks: Map<string, StockState>): Map<string, StockState> {
  const next = new Map<string, StockState>();
  stocks.forEach((stock, id) => {
    const prof = professors.find(p => p.id === id)!;
    const basePrice = sentimentToBasePrice(prof);
    const volatility = 0.005 + (prof.difficulty / 5) * 0.02;
    const drift = (basePrice - stock.price) * 0.003;
    const sentimentNoise = (prof.sentiment > 70 ? 0.002 : prof.sentiment < 40 ? -0.002 : 0);
    const newPrice = Math.max(0.5, stock.price * (1 + drift + sentimentNoise + (Math.random() - 0.48) * volatility));
    const rounded = Math.round(newPrice * 100) / 100;
    const newHistory = [...stock.history.slice(-99), { time: Date.now(), price: rounded }];
    next.set(id, {
      ...stock,
      previousPrice: stock.price,
      price: rounded,
      change: Math.round((rounded - stock.price) * 100) / 100,
      changePercent: Math.round(((rounded - stock.price) / stock.price) * 10000) / 100,
      history: newHistory,
      volume: stock.volume + Math.floor(Math.random() * 50),
      high: Math.max(stock.high, rounded),
      low: Math.min(stock.low, rounded),
      marketCap: Math.round(rounded * TOTAL_SHARES),
    });
  });
  return next;
}

export function createPortfolio(): Portfolio {
  return { cash: INITIAL_CASH, holdings: [] };
}

export function buyStock(portfolio: Portfolio, professorId: string, shares: number, price: number): Portfolio {
  const cost = shares * price;
  if (cost > portfolio.cash) return portfolio;
  const existing = portfolio.holdings.find(h => h.professorId === professorId);
  let newHoldings: Holding[];
  if (existing) {
    const totalShares = existing.shares + shares;
    const avgCost = (existing.avgCost * existing.shares + cost) / totalShares;
    newHoldings = portfolio.holdings.map(h => h.professorId === professorId ? { ...h, shares: totalShares, avgCost: Math.round(avgCost * 100) / 100 } : h);
  } else {
    newHoldings = [...portfolio.holdings, { professorId, shares, avgCost: price }];
  }
  return { cash: Math.round((portfolio.cash - cost) * 100) / 100, holdings: newHoldings };
}

export function sellStock(portfolio: Portfolio, professorId: string, shares: number, price: number): Portfolio {
  const existing = portfolio.holdings.find(h => h.professorId === professorId);
  if (!existing || existing.shares < shares) return portfolio;
  const revenue = shares * price;
  const remainingShares = existing.shares - shares;
  const newHoldings = remainingShares > 0
    ? portfolio.holdings.map(h => h.professorId === professorId ? { ...h, shares: remainingShares } : h)
    : portfolio.holdings.filter(h => h.professorId !== professorId);
  return { cash: Math.round((portfolio.cash + revenue) * 100) / 100, holdings: newHoldings };
}
