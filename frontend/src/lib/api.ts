/**
 * API Service Layer
 * Configure API_BASE_URL to point to your Express/MongoDB backend.
 * All endpoints return JSON matching the existing TypeScript interfaces.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Retrieves the auth token from localStorage.
 */
function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API request failed");
  }
  return res.json();
}

// ─── Stock/Professor endpoints ───────────────────────────

export interface StockData {
  professorId: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  history: { time: number; price: number }[];
  volume: number;
  high: number;
  low: number;
  marketCap: number;
}

export interface ProfessorData {
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

export interface PortfolioData {
  cash: number;
  holdings: { professorId: string; shares: number; avgCost: number }[];
}

export interface TradeResponse {
  success: boolean;
  portfolio: PortfolioData;
  message?: string;
}

/** Fetch all professors */
export const fetchProfessors = () =>
  request<ProfessorData[]>("/professors");

/** Fetch all current stock prices */
export const fetchStocks = () =>
  request<Record<string, StockData>>("/stocks");

/** Fetch single stock */
export const fetchStock = (professorId: string) =>
  request<StockData>(`/stocks/${professorId}`);

/** Fetch user portfolio */
export const fetchPortfolio = () =>
  request<PortfolioData>("/portfolio");

/** Buy shares */
export const buyShares = (professorId: string, shares: number) =>
  request<TradeResponse>("/trade/buy", {
    method: "POST",
    body: JSON.stringify({ professorId, shares }),
  });

/** Sell shares */
export const sellShares = (professorId: string, shares: number) =>
  request<TradeResponse>("/trade/sell", {
    method: "POST",
    body: JSON.stringify({ professorId, shares }),
  });
