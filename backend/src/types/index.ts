/**
 * Common Type Definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: PaginationInfo;
}

export interface AuthPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export type TradeType = 'buy' | 'sell';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TrendType = 'bullish' | 'neutral' | 'bearish';
export type PeriodType = '24h' | '7d' | '1m' | '6m';
