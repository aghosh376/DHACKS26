import { useState } from "react";
import { motion } from "framer-motion";
import { professors } from "@/lib/professors";
import { useSimulator } from "@/hooks/useSimulator";
import TickerBar from "@/components/TickerBar";
import ProfessorCard from "@/components/ProfessorCard";
import TradeModal from "@/components/TradeModal";
import PortfolioPanel from "@/components/PortfolioPanel";

const Index = () => {
  const { stocks, portfolio, buy, sell, totalValue, totalPL } = useSimulator();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "sentiment" | "change">("price");

  const selectedProf = selectedId ? professors.find(p => p.id === selectedId) : null;
  const selectedStock = selectedId ? stocks.get(selectedId) : null;

  const sorted = [...professors].sort((a, b) => {
    const sa = stocks.get(a.id)!;
    const sb = stocks.get(b.id)!;
    if (sortBy === "price") return sb.price - sa.price;
    if (sortBy === "sentiment") return b.sentiment - a.sentiment;
    return sb.changePercent - sa.changePercent;
  });

  return (
    <div className="min-h-screen bg-background">
      <TickerBar stocks={stocks} />

      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              <span className="text-accent">Prof</span>Exchange
            </h1>
            <p className="text-sm text-muted-foreground">Trade professors like stocks. Powered by student sentiment.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
              <div className="font-mono font-bold text-lg">${totalValue.toFixed(2)}</div>
            </div>
            <div className={`text-right px-3 py-1.5 rounded-lg ${totalPL >= 0 ? "bg-gain/10" : "bg-loss/10"}`}>
              <div className="text-xs text-muted-foreground">P/L</div>
              <div className={`font-mono font-bold ${totalPL >= 0 ? "text-gain" : "text-loss"}`}>
                {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Market */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Market</h2>
              <div className="flex gap-1 bg-secondary rounded-lg p-1">
                {(["price", "sentiment", "change"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                      sortBy === s ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((prof, i) => {
                const stock = stocks.get(prof.id)!;
                return (
                  <motion.div key={prof.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ProfessorCard professor={prof} stock={stock} onClick={() => setSelectedId(prof.id)} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 xl:w-96">
            <PortfolioPanel portfolio={portfolio} stocks={stocks} totalValue={totalValue} totalPL={totalPL} />
          </div>
        </div>
      </main>

      {/* Trade Modal */}
      {selectedProf && selectedStock && (
        <TradeModal
          professor={selectedProf}
          stock={selectedStock}
          portfolio={portfolio}
          onBuy={(shares) => buy(selectedProf.id, shares)}
          onSell={(shares) => sell(selectedProf.id, shares)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default Index;
