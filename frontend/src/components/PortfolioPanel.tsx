import { professors } from "@/lib/professors";
import type { StockState, Portfolio } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  portfolio: Portfolio;
  stocks: Map<string, StockState>;
  totalValue: number;
  totalPL: number;
}

const PortfolioPanel = ({ portfolio, stocks, totalValue, totalPL }: Props) => {
  const isUp = totalPL >= 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-bold text-lg mb-4">Your Portfolio</h2>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Total Value</div>
          <div className="font-mono font-bold text-lg">${totalValue.toFixed(2)}</div>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Cash</div>
          <div className="font-mono font-bold text-lg">${portfolio.cash.toFixed(2)}</div>
        </div>
        <div className={`rounded-xl p-3 text-center ${isUp ? "bg-gain/10 glow-gain" : "bg-loss/10 glow-loss"}`}>
          <div className="text-xs text-muted-foreground mb-1">P/L</div>
          <div className={`font-mono font-bold text-lg ${isUp ? "text-gain" : "text-loss"}`}>
            {isUp ? "+" : ""}${totalPL.toFixed(2)}
          </div>
        </div>
      </div>

      {portfolio.holdings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No holdings yet. Click a professor to start trading!</p>
      ) : (
        <div className="space-y-2">
          {portfolio.holdings.map(h => {
            const prof = professors.find(p => p.id === h.professorId)!;
            const stock = stocks.get(h.professorId)!;
            const currentValue = stock.price * h.shares;
            const costBasis = h.avgCost * h.shares;
            const pl = currentValue - costBasis;
            const plPercent = (pl / costBasis) * 100;
            const holdingUp = pl >= 0;

            return (
              <motion.div
                key={h.professorId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-secondary rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{prof.avatar}</span>
                  <div>
                    <span className="font-mono font-bold text-sm">{prof.ticker}</span>
                    <span className="text-xs text-muted-foreground ml-2">{h.shares} shares</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">${currentValue.toFixed(2)}</div>
                  <div className={`font-mono text-xs ${holdingUp ? "text-gain" : "text-loss"}`}>
                    {holdingUp ? "+" : ""}{plPercent.toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioPanel;
