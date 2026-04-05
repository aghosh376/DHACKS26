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
  const isUp = stock.changePercent >= 0;

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
            <span className="text-3xl">{professor.avatar}</span>
            <div>
              <div className="font-mono font-bold text-lg text-foreground">{professor.ticker}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[140px]">{professor.name}</div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {professor.department}
          </span>
        </div>

        {professor.rating && (
          <p className="text-xs text-muted-foreground mb-3">
            Rating: <span className="font-mono font-semibold text-foreground">{professor.rating.toFixed(1)}</span>/5
          </p>
        )}

        {/* Price Section */}
        <div className="mb-3 p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground font-semibold mb-1">Stock Price</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-mono font-bold text-foreground">${stock.price.toFixed(2)}</p>
            <div
              className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${
                isUp ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
              }`}
            >
              {isUp ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* User Holdings */}
        {userShares > 0 && (
          <div className="mb-3 p-3 bg-accent/10 rounded-lg">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Your Holdings</p>
            <p className="text-lg font-mono font-bold text-accent">{userShares} shares</p>
            <p className="text-sm text-muted-foreground">
              Value: <span className="font-mono">${(userShares * stock.price).toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* Mini sparkline */}
        <div className="h-10 flex items-end gap-[2px] mb-3">
          {stock.history.slice(-20).map((point, i, arr) => {
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
          })}
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4 text-xs text-muted-foreground font-mono">
          <span>Vol: {stock.volume.toLocaleString()}</span>
          <span>Sent: {professor.sentiment}%</span>
          <span>★ {professor.rating}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(professor.id);
            }}
            disabled={userBalance < stock.price}
            className="flex-1 rounded-lg bg-gain py-2 px-4 text-sm font-bold text-primary-foreground hover:bg-gain/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title={userBalance < stock.price ? "Insufficient balance" : "Buy stocks"}
          >
            Buy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSellClick(professor.id);
            }}
            disabled={userShares === 0}
            className="flex-1 rounded-lg bg-loss py-2 px-4 text-sm font-bold text-destructive-foreground hover:bg-loss/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title={userShares === 0 ? "You don't own any shares" : "Sell stocks"}
          >
            Sell
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessorCard;
