import { FC } from "react";
import { motion } from "framer-motion";
import type { Professor, StockState } from "@/lib/types";

interface ProfessorCardProps {
  professor: Professor;
  stock: StockState;
  userShares?: number;
  userBalance?: number;
  onBuyClick: (professorId: string) => void;
  onSellClick: (professorId: string) => void;
}

const ProfessorCard: FC<ProfessorCardProps> = ({
  professor,
  stock,
  userShares = 0,
  userBalance = 0,
  onBuyClick,
  onSellClick,
}) => {
  // Safe fallbacks for live database data
  const currentPrice = stock?.price ?? 0;
  const changePercent = stock?.changePercent ?? 0;
  const isUp = changePercent >= 0;
  const history = stock?.history || [];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl border bg-card overflow-hidden transition-shadow ${
        isUp ? "border-gain/20 glow-gain" : "border-loss/20 glow-loss"
      }`}
    >
      <div className="p-5">
        {/* Professor Info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{professor.avatar || "👨‍🏫"}</span>
            <div>
              <div className="font-mono font-bold text-lg text-foreground">{professor.ticker}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[140px]">{professor.name}</div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {professor.department || "General"}
          </span>
        </div>

        {/* Prevent the React '0' rendering bug */}
        {professor.rating != null && (
          <p className="text-xs text-muted-foreground mb-3">
            Rating: <span className="font-mono font-semibold text-foreground">{Math.min(100, Math.round(professor.rating))}</span>/100
          </p>
        )}

        {/* Price Section */}
        <div className="mb-3 p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground font-semibold mb-1">Stock Price</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-mono font-bold text-foreground">${currentPrice.toFixed(2)}</p>
            <div
              className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${
                isUp ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
              }`}
            >
              {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* User Holdings */}
        {userShares > 0 && (
          <div className="mb-3 p-3 bg-accent/10 rounded-lg">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Your Holdings</p>
            <p className="text-lg font-mono font-bold text-accent">{userShares} shares</p>
            <p className="text-sm text-muted-foreground">
              Value: <span className="font-mono">${(userShares * currentPrice).toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* Mini sparkline (Safely handles empty database arrays) */}
        <div className="h-10 flex items-end gap-[2px] mb-3">
          {history.length > 0 ? (
            history.slice(-20).map((point, i, arr) => {
              const min = Math.min(...arr.map((p) => p.price));
              const max = Math.max(...arr.map((p) => p.price));
              const range = max - min || 1;
              const height = ((point.price - min) / range) * 100;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${isUp ? "bg-gain/60" : "bg-loss/60"}`}
                  style={{ height: `${Math.max(5, height)}%` }}
                />
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground/50 border border-dashed border-border rounded">
              Awaiting Market Data
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4 text-xs text-muted-foreground font-mono">
          <span>Vol: {(stock?.volume || 0).toLocaleString()}</span>
          <span>Sent: {professor.sentiment || 0}%</span>
          <span>★ {professor.rating != null ? Math.min(100, Math.round(professor.rating)) : "N/A"}/100</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(professor.id);
            }}
            disabled={userBalance < currentPrice}
            className="flex-1 rounded-lg bg-gain py-2 px-4 text-sm font-bold text-primary-foreground hover:bg-gain/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title={userBalance < currentPrice ? "Insufficient balance" : "Buy stocks"}
          >
            Buy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSellClick(professor.id);
            }}
            disabled={userShares <= 0}
            className="flex-1 rounded-lg bg-loss py-2 px-4 text-sm font-bold text-destructive-foreground hover:bg-loss/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title={userShares <= 0 ? "You don't own any shares" : "Sell stocks"}
          >
            Sell
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessorCard;