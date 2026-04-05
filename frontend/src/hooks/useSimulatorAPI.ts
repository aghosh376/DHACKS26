/**
 * useSimulatorAPI — Tries to fetch from your Express/MongoDB backend.
 * Falls back to local placeholder data if the backend is unreachable.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchProfessors,
  fetchStocks,
  fetchPortfolio,
  buyShares,
  sellShares,
} from "@/lib/api";
import { professors as localProfessors } from "@/lib/professors";
import { initializeStocks, createPortfolio, buyStock, sellStock } from "@/lib/simulator";
import type { StockState, Portfolio, Professor } from "@/lib/types";

const INITIAL_CASH = 10000;
const POLL_INTERVAL = 3000;

export function useSimulatorAPI() {
  const [stocks, setStocks] = useState<Map<string, StockState>>(() => initializeStocks());
  const [portfolio, setPortfolio] = useState<Portfolio>(() => createPortfolio());
  const [professors, setProfessors] = useState<Professor[]>(localProfessors);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useBackend, setUseBackend] = useState(false);

  // Try to load from backend; if it fails, keep local data
  useEffect(() => {
    async function init() {
      try {
        const [profs, stockData, port] = await Promise.all([
          fetchProfessors(),
          fetchStocks(),
          fetchPortfolio(),
        ]);
        setProfessors(profs as unknown as Professor[]);
        const stockMap = new Map<string, StockState>();
        Object.entries(stockData).forEach(([id, s]) => stockMap.set(id, s as unknown as StockState));
        setStocks(stockMap);
        setPortfolio(port as unknown as Portfolio);
        setUseBackend(true);
      } catch {
        // Backend unavailable — local placeholder data already set
      }
      setLoading(false);
    }
    init();
  }, []);

  // Poll for price updates only when backend is connected
  useEffect(() => {
    if (!useBackend) return;
    const interval = setInterval(async () => {
      try {
        const stockData = await fetchStocks();
        const stockMap = new Map<string, StockState>();
        Object.entries(stockData).forEach(([id, s]) => stockMap.set(id, s as unknown as StockState));
        setStocks(stockMap);
      } catch {
        // Silently retry on next tick
      }
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [useBackend]);

  const buy = useCallback(async (professorId: string, shares: number) => {
    if (useBackend) {
      try {
        const result = await buyShares(professorId, shares);
        if (result.success) {
          setPortfolio(result.portfolio as unknown as Portfolio);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    // Local fallback
    const stock = stocks.get(professorId);
    if (!stock) return false;
    const newPortfolio = buyStock(portfolio, professorId, shares, stock.price);
    if (newPortfolio === portfolio) return false;
    setPortfolio(newPortfolio);
    return true;
  }, [useBackend, stocks, portfolio]);

  const sell = useCallback(async (professorId: string, shares: number) => {
    if (useBackend) {
      try {
        const result = await sellShares(professorId, shares);
        if (result.success) {
          setPortfolio(result.portfolio as unknown as Portfolio);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    // Local fallback
    const stock = stocks.get(professorId);
    if (!stock) return false;
    const newPortfolio = sellStock(portfolio, professorId, shares, stock.price);
    if (newPortfolio === portfolio) return false;
    setPortfolio(newPortfolio);
    return true;
  }, [useBackend, stocks, portfolio]);

  const totalValue = portfolio.holdings.reduce((sum, h) => {
    const stock = stocks.get(h.professorId);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0) + portfolio.cash;

  const totalPL = totalValue - INITIAL_CASH;

  return { stocks, portfolio, professors, buy, sell, totalValue, totalPL, loading, error };
}
