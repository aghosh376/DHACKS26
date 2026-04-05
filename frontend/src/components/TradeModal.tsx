import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Professor, StockState, Portfolio } from "@/lib/types";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

interface Props {
  professor: Professor;
  stock: StockState;
  portfolio: Portfolio;
  onBuy: (shares: number) => Promise<boolean> | boolean;
  onSell: (shares: number) => Promise<boolean> | boolean;
  onClose: () => void;
}

const TradeModal = ({ professor, stock, portfolio, onBuy, onSell, onClose }: Props) => {
  const [shares, setShares] = useState(1);
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [trading, setTrading] = useState(false);

  const holding = portfolio.holdings.find(h => h.professorId === professor.id);
  const maxBuy = Math.floor(portfolio.cash / stock.price);
  const maxSell = holding?.shares || 0;
  const isUp = stock.change >= 0;

  const handleTrade = async () => {
    setTrading(true);
    const success = await (mode === "buy" ? onBuy(shares) : onSell(shares));
    setTrading(false);
    if (success) {
      setFeedback(`${mode === "buy" ? "Bought" : "Sold"} ${shares} shares of ${professor.ticker}!`);
      setTimeout(() => setFeedback(null), 2000);
      setShares(1);
    } else {
      setFeedback(mode === "buy" ? "Insufficient funds!" : "Not enough shares!");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const chartData = stock.history.map(p => ({ price: p.price }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{professor.avatar}</span>
              <div>
                <h2 className="font-mono font-bold text-2xl">{professor.ticker}</h2>
                <p className="text-muted-foreground text-sm">{professor.name} · {professor.department}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
          </div>

          {/* Price & Chart */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-mono font-bold text-3xl">${stock.price.toFixed(2)}</span>
              <span className={`font-mono font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
                {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="h-32 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isUp ? "hsl(155, 100%, 50%)" : "hsl(0, 75%, 55%)"} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isUp ? "hsl(155, 100%, 50%)" : "hsl(0, 75%, 55%)"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Tooltip
                    contentStyle={{ background: "hsl(222, 25%, 11%)", border: "1px solid hsl(222, 20%, 18%)", borderRadius: "8px", fontFamily: "JetBrains Mono" }}
                    labelStyle={{ display: "none" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke={isUp ? "hsl(155, 100%, 50%)" : "hsl(0, 75%, 55%)"} fill="url(#priceGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5 text-center">
            {[
              { label: "Sentiment", value: `${professor.sentiment}%` },
              { label: "Rating", value: `★ ${professor.rating}` },
              { label: "Difficulty", value: professor.difficulty.toFixed(1) },
              { label: "Mkt Cap", value: `$${(stock.marketCap / 1000).toFixed(1)}K` },
            ].map(s => (
              <div key={s.label} className="bg-secondary rounded-lg p-2">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="font-mono font-semibold text-sm">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {professor.tags.map(tag => (
              <span key={tag} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">{tag}</span>
            ))}
          </div>

          {/* Trade Controls */}
          <div className="space-y-3">
            <div className="flex rounded-lg bg-secondary p-1">
              {(["buy", "sell"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setShares(1); }}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                    mode === m
                      ? m === "buy" ? "bg-gain text-primary-foreground" : "bg-loss text-destructive-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground w-16">Shares</label>
              <input
                type="number"
                min={1}
                max={mode === "buy" ? maxBuy : maxSell}
                value={shares}
                onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-secondary rounded-lg px-3 py-2 font-mono text-foreground border border-border focus:border-ring focus:outline-none"
              />
              <button
                onClick={() => setShares(mode === "buy" ? maxBuy : maxSell)}
                className="text-xs text-accent hover:text-accent/80 font-semibold"
              >
                MAX
              </button>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground font-mono">
              <span>Total: ${(shares * stock.price).toFixed(2)}</span>
              <span>{mode === "buy" ? `Cash: $${portfolio.cash.toFixed(2)}` : `Owned: ${maxSell}`}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTrade}
              disabled={mode === "buy" ? shares > maxBuy || maxBuy === 0 : shares > maxSell || maxSell === 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity disabled:opacity-40 ${
                mode === "buy" ? "bg-gain text-primary-foreground" : "bg-loss text-destructive-foreground"
              }`}
            >
              {mode === "buy" ? "Buy" : "Sell"} {shares} {professor.ticker}
            </motion.button>

            {feedback && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-semibold text-accent">
                {feedback}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TradeModal;
