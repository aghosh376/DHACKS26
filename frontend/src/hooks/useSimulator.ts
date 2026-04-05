import { useState, useEffect, useCallback } from "react";
import { initializeStocks, tickPrices, createPortfolio, buyStock, sellStock, type StockState, type Portfolio } from "@/lib/simulator";

export function useSimulator() {
  const [stocks, setStocks] = useState<Map<string, StockState>>(() => initializeStocks());
  const [portfolio, setPortfolio] = useState<Portfolio>(() => createPortfolio());

  // Price ticking removed — prices are now static until updated by the backend

  const buy = useCallback((professorId: string, shares: number) => {
    const stock = stocks.get(professorId);
    if (!stock) return false;
    const newPortfolio = buyStock(portfolio, professorId, shares, stock.price);
    if (newPortfolio === portfolio) return false;
    setPortfolio(newPortfolio);
    return true;
  }, [stocks, portfolio]);

  const sell = useCallback((professorId: string, shares: number) => {
    const stock = stocks.get(professorId);
    if (!stock) return false;
    const newPortfolio = sellStock(portfolio, professorId, shares, stock.price);
    if (newPortfolio === portfolio) return false;
    setPortfolio(newPortfolio);
    return true;
  }, [stocks, portfolio]);

  const totalValue = portfolio.holdings.reduce((sum, h) => {
    const stock = stocks.get(h.professorId);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0) + portfolio.cash;

  const totalPL = totalValue - 10000;

  return { stocks, portfolio, buy, sell, totalValue, totalPL };
}
