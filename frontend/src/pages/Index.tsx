import { useState } from "react";
import { motion } from "framer-motion";
import { professors } from "@/lib/professors";
import { useSimulatorAPI } from "@/hooks/useSimulatorAPI";
import TickerBar from "@/components/TickerBar";
import ProfessorCard from "@/components/ProfessorCard";
import TradeModal from "@/components/TradeModal";
import PortfolioPanel from "@/components/PortfolioPanel";
import type { User } from "@/App";

interface Props {
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const Index = ({ user, setToken, setUser }: Props) => {
  const { stocks, portfolio, professors: profs, buy, sell, totalValue, totalPL, loading, error } = useSimulatorAPI();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "sentiment" | "change">("price");

  const activeProfessors = profs.length > 0 ? profs : professors;
  const selectedProf = selectedId ? activeProfessors.find(p => p.id === selectedId) : null;
  const selectedStock = selectedId ? stocks.get(selectedId) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  const sorted = [...activeProfessors].sort((a, b) => {
    const sa = stocks.get(a.id);
    const sb = stocks.get(b.id);
    if (!sa || !sb) return 0;
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
            {user && (
              <span className="text-sm text-muted-foreground">
                Hey, <span className="text-foreground font-medium">{user.name}</span>
              </span>
            )}
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
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
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
                    <ProfessorCard professor={prof} stock={stock} userShares={0} userBalance={0} onBuyClick={() => setSelectedId(prof.id)} onSellClick={() => setSelectedId(prof.id)} />
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
