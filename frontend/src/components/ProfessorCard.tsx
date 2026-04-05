import { motion } from "framer-motion";
import type { Professor } from "@/lib/professors";
import type { StockState } from "@/lib/simulator";

interface Props {
  professor: Professor;
  stock: StockState;
  onClick: () => void;
}

const ProfessorCard = ({ professor, stock, onClick }: Props) => {
  const isUp = stock.change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-card p-5 transition-shadow ${isUp ? "border-gain/20 glow-gain" : "border-loss/20 glow-loss"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{professor.avatar}</span>
          <div>
            <div className="font-mono font-bold text-lg text-foreground">{professor.ticker}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[140px]">{professor.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-xl text-foreground">${stock.price.toFixed(2)}</div>
          <div className={`font-mono text-sm font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
            {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{professor.department}</span>
      </div>

      {/* Mini sparkline */}
      <div className="h-10 flex items-end gap-[2px]">
        {stock.history.slice(-20).map((point, i, arr) => {
          const min = Math.min(...arr.map(p => p.price));
          const max = Math.max(...arr.map(p => p.price));
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

      <div className="flex justify-between mt-3 text-xs text-muted-foreground font-mono">
        <span>Vol: {stock.volume.toLocaleString()}</span>
        <span>Sent: {professor.sentiment}%</span>
        <span>★ {professor.rating}</span>
      </div>
    </motion.div>
  );
};

export default ProfessorCard;
