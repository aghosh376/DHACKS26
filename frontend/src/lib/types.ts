/**
 * Shared frontend types — used by all components.
 * These match the shape your MongoDB/Express API should return.
 */

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

export interface Professor {
  id: string;
  ticker: string;
  name: string;
  department: string;
  avatar: string;
  sentiment: number;
  rating: number;
  difficulty: number;
  tags: string[];
}
