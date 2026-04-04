import { professors } from "@/lib/professors";
import type { StockState } from "@/lib/simulator";

const TickerBar = ({ stocks }: { stocks: Map<string, StockState> }) => {
  const items = professors.map(p => {
    const stock = stocks.get(p.id);
    if (!stock) return null;
    const isUp = stock.change >= 0;
    return (
      <span key={p.id} className="inline-flex items-center gap-2 px-4">
        <span className="font-mono font-bold text-foreground">{p.ticker}</span>
        <span className="font-mono">${stock.price.toFixed(2)}</span>
        <span className={isUp ? "text-gain font-mono" : "text-loss font-mono"}>
          {isUp ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
        </span>
      </span>
    );
  });

  return (
    <div className="overflow-hidden border-b border-border bg-card/50 py-2">
      <div className="ticker-scroll flex whitespace-nowrap">
        {items}{items}
      </div>
    </div>
  );
};

export default TickerBar;
