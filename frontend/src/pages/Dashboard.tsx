import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProfessorCard from "@/components/ProfessorCard";
import BuyModal from "@/components/BuyModal";
import SellModal from "@/components/SellModal";
import PortfolioPanel from "@/components/PortfolioPanel";
import TickerBar from "@/components/TickerBar";
import { professors as localProfessors } from "@/lib/professors";
import { initializeStocks } from "@/lib/simulator";
import type { Professor, StockState } from "@/lib/types";
import type { User } from "@/App";

// ─── Backend types (from populated MongoDB docs) ─────────
interface BackendStock {
  _id: string;
  professorId: any;
  currentPrice: number;
  percentChange24h: number;
  volume24h: number;
}

interface BackendProfessor {
  _id: string;
  name: string;
  department: string;
  email?: string;
  imageUrl?: string;
  currScore?: number;
  overallScore?: number;
  rmpScore?: number;
  setScore?: number;
  redditScore?: number;
}

interface DashboardProps {
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const Dashboard: FC<DashboardProps> = ({ user, setToken, setUser }) => {
  const navigate = useNavigate();

  const [backendStocks, setBackendStocks] = useState<BackendStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const [localStocks] = useState<Map<string, StockState>>(() => initializeStocks());

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<BackendProfessor | null>(null);
  const [selectedBackendStock, setSelectedBackendStock] = useState<BackendStock | null>(null);
  const [selectedLocalProfId, setSelectedLocalProfId] = useState<string | null>(null);
  const [selectedProfessorShares, setSelectedProfessorShares] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const token = localStorage.getItem("token");

  // ─── Fetch on mount ───────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const stocksRes = await fetch("/api/stocks", { headers });
        if (!stocksRes.ok) throw new Error("Failed to fetch stocks");
        const stocksData = await stocksRes.json();
        setBackendStocks(stocksData.data || []);
        setUseBackend(true);
      } catch {
        setUseBackend(false);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);

  // ─── Auto-refresh every 10s ───────────────────────────
  useEffect(() => {
    if (!useBackend) return;
    const interval = setInterval(async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const stocksRes = await fetch("/api/stocks", { headers });
        if (stocksRes.ok) {
          const stocksData = await stocksRes.json();
          setBackendStocks(stocksData.data || []);
        }
      } catch {
        console.debug("Stock price refresh error");
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [token, useBackend]);

  // ─── Helpers ──────────────────────────────────────────
  const getUserShares = (professorId: string): number =>
    user?.stocksOwned?.find((h: any) => h.professorId === professorId)?.shares || 0;

  const getUserAverageBuyPrice = (professorId: string): number =>
    user?.stocksOwned?.find((h: any) => h.professorId === professorId)?.averageBuyPrice || 0;

  const getAllDepartments = (): string[] => {
    const departments = new Set<string>();
    if (useBackend) {
      backendStocks.forEach((s) => {
        const prof = s.professorId as any;
        if (prof?.department) departments.add(prof.department);
      });
    } else {
      localProfessors.forEach((p) => departments.add(p.department));
    }
    return Array.from(departments).sort();
  };

  const buildProfessor = (professorData: any): Professor => ({
    id: professorData._id,
    ticker: (professorData.name || "").split(" ").pop()?.substring(0, 4).toUpperCase() || "PROF",
    name: professorData.name || "Unknown",
    department: professorData.department || "N/A",
    email: professorData.email,
    avatar: "👨‍🏫", // Lovable default avatar
    sentiment: Math.round((professorData.currScore || 3) * 20),
    rating: professorData.currScore || 3,
    difficulty: 3,
    tags: [],
    // Extended properties for modals
    overallScore: professorData.overallScore,
    rmpScore: professorData.rmpScore,
    setScore: professorData.setScore,
    redditScore: professorData.redditScore,
  } as any);

  // ─── Ticker map for TickerBar ─────────────────────────
  const tickerStocksMap = (() => {
    if (useBackend) {
      const m = new Map<string, StockState>();
      backendStocks.forEach((s) => {
        const prof = s.professorId as any;
        if (!prof?._id) return;
        m.set(prof._id, {
          professorId: prof._id,
          price: s.currentPrice,
          previousPrice: s.currentPrice,
          change: s.percentChange24h >= 0 ? 0.01 : -0.01,
          changePercent: s.percentChange24h,
          history: [],
          volume: s.volume24h,
          high: s.currentPrice,
          low: s.currentPrice,
          marketCap: 0,
        });
      });
      return m;
    }
    return localStocks;
  })();

  // ─── Buy/Sell click handlers ──────────────────────────
  const handleBuyClick = (professorId: string, stock: any) => {
    if (useBackend) {
      const backendStock = backendStocks.find((s) => (s.professorId as any)?._id === professorId);
      if (!backendStock) return;
      const prof = backendStock.professorId as any;
      setSelectedProfessor({
        _id: prof._id,
        name: prof.name || "Unknown",
        department: prof.department || "N/A",
        email: prof.email,
        imageUrl: prof.imageUrl,
        currScore: prof.currScore,
        overallScore: prof.overallScore,
        rmpScore: prof.rmpScore,
        setScore: prof.setScore,
        redditScore: prof.redditScore,
      });
      setSelectedBackendStock(backendStock);
      setBuyModalOpen(true);
    } else {
      setSelectedLocalProfId(professorId);
      setBuyModalOpen(true);
    }
  };

  const handleSellClick = (professorId: string, stock: any, shares: number) => {
    const userShares = getUserShares(professorId);
    if (useBackend) {
      const backendStock = backendStocks.find((s) => (s.professorId as any)?._id === professorId);
      if (!backendStock) return;
      const prof = backendStock.professorId as any;
      setSelectedProfessor({
        _id: prof._id,
        name: prof.name || "Unknown",
        department: prof.department || "N/A",
        email: prof.email,
        imageUrl: prof.imageUrl,
        currScore: prof.currScore,
        overallScore: prof.overallScore,
        rmpScore: prof.rmpScore,
        setScore: prof.setScore,
        redditScore: prof.redditScore,
      });
      setSelectedBackendStock(backendStock);
      setSelectedProfessorShares(userShares);
      setSellModalOpen(true);
    } else {
      setSelectedLocalProfId(professorId);
      setSelectedProfessorShares(userShares);
      setSellModalOpen(true);
    }
  };

  // ─── Buy confirm ─────────────────────────────────────
  const handleBuyConfirm = async (quantity: number): Promise<void> => {
    if (useBackend) {
      if (!selectedProfessor || !selectedBackendStock || !token) return;
      try {
        setTransactionLoading(true);
        const response = await fetch(`/api/stocks/${selectedProfessor._id}/buy`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to buy stocks");
        }
        const result = await response.json();
        if (result.data?.user) {
          const updatedUser: any = {
            ...user,
            balance: parseFloat(result.data.user.newBalance),
            portfolioValue: parseFloat(result.data.user.portfolioValue),
            stocksOwned: user?.stocksOwned || [],
          };
          const existing = updatedUser.stocksOwned?.find((h: any) => h.professorId === selectedProfessor._id);
          if (existing) {
            existing.shares = result.data.user.holdings.shares;
            existing.averageBuyPrice = result.data.user.holdings.averageBuyPrice;
          } else {
            updatedUser.stocksOwned?.push({
              professorId: selectedProfessor._id,
              shares: quantity,
              costBasis: result.data.transaction.totalAmount,
              averageBuyPrice: result.data.transaction.pricePerShare,
            });
          }
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setBackendStocks((prev) =>
          prev.map((s) =>
            s._id === selectedBackendStock._id
              ? { ...s, currentPrice: parseFloat(result.data.stock.newPrice) }
              : s
          )
        );
        alert(`Successfully bought ${quantity} shares!`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        alert(`Purchase failed: ${message}`);
        throw err;
      } finally {
        setTransactionLoading(false);
      }
    } else {
      if (!selectedLocalProfId) return;
      const stock = localStocks.get(selectedLocalProfId);
      if (!stock) return;
      const cost = quantity * stock.price;
      const currentBalance = user?.balance ?? 10000;
      if (cost > currentBalance) throw new Error("Insufficient funds");
      const updatedUser: any = {
        ...user,
        balance: currentBalance - cost,
        stocksOwned: [...(user?.stocksOwned || [])],
      };
      const existing = updatedUser.stocksOwned.find((h: any) => h.professorId === selectedLocalProfId);
      if (existing) {
        const totalShares = existing.shares + quantity;
        existing.averageBuyPrice = (existing.averageBuyPrice * existing.shares + cost) / totalShares;
        existing.shares = totalShares;
      } else {
        updatedUser.stocksOwned.push({
          professorId: selectedLocalProfId,
          shares: quantity,
          costBasis: cost,
          averageBuyPrice: stock.price,
        });
      }
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert(`Successfully bought ${quantity} shares!`);
    }
  };

  // ─── Sell confirm ────────────────────────────────────
  const handleSellConfirm = async (quantity: number): Promise<void> => {
    if (useBackend) {
      if (!selectedProfessor || !selectedBackendStock || !token) return;
      try {
        setTransactionLoading(true);
        const response = await fetch(`/api/stocks/${selectedProfessor._id}/sell`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to sell stocks");
        }
        const result = await response.json();
        if (result.data?.user) {
          const updatedUser: any = {
            ...user,
            balance: parseFloat(result.data.user.newBalance),
            portfolioValue: parseFloat(result.data.user.portfolioValue),
            stocksOwned: user?.stocksOwned || [],
          };
          const holdingIndex = updatedUser.stocksOwned?.findIndex(
            (h: any) => h.professorId === selectedProfessor._id
          );
          if (holdingIndex !== undefined && holdingIndex !== -1) {
            if (result.data.user.holdings.shares === 0) {
              updatedUser.stocksOwned?.splice(holdingIndex, 1);
            } else {
              updatedUser.stocksOwned![holdingIndex].shares = result.data.user.holdings.shares;
            }
          }
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setBackendStocks((prev) =>
          prev.map((s) =>
            s._id === selectedBackendStock._id
              ? { ...s, currentPrice: parseFloat(result.data.stock.newPrice) }
              : s
          )
        );
        alert(`Successfully sold ${quantity} shares!`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        alert(`Sale failed: ${message}`);
        throw err;
      } finally {
        setTransactionLoading(false);
      }
    } else {
      if (!selectedLocalProfId) return;
      const stock = localStocks.get(selectedLocalProfId);
      if (!stock) return;
      const currentShares = getUserShares(selectedLocalProfId);
      if (quantity > currentShares) throw new Error("Not enough shares");
      const revenue = quantity * stock.price;
      const updatedUser: any = {
        ...user,
        balance: (user?.balance ?? 10000) + revenue,
        stocksOwned: [...(user?.stocksOwned || [])],
      };
      const holdingIndex = updatedUser.stocksOwned.findIndex(
        (h: any) => h.professorId === selectedLocalProfId
      );
      if (holdingIndex !== -1) {
        const remaining = updatedUser.stocksOwned[holdingIndex].shares - quantity;
        if (remaining <= 0) {
          updatedUser.stocksOwned.splice(holdingIndex, 1);
        } else {
          updatedUser.stocksOwned[holdingIndex].shares = remaining;
        }
      }
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert(`Successfully sold ${quantity} shares!`);
    }
  };

  const closeModals = () => {
    setBuyModalOpen(false);
    setSellModalOpen(false);
    setSelectedProfessor(null);
    setSelectedBackendStock(null);
    setSelectedLocalProfId(null);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ─── Derive display data ─────────────────────────────
  const displayItems: { professor: Professor; stock: StockState; profBackendId: string }[] = (() => {
    if (useBackend) {
      return backendStocks
        .map((s) => {
          const p = s.professorId as any;
          if (!p?._id) return null;
          const professor: Professor = buildProfessor(p);
          const stock: StockState = {
            professorId: p._id,
            price: s.currentPrice,
            previousPrice: s.currentPrice,
            change: s.percentChange24h >= 0 ? 0.01 : -0.01,
            changePercent: s.percentChange24h,
            history: [],
            volume: s.volume24h,
            high: s.currentPrice,
            low: s.currentPrice,
            marketCap: 0,
          };
          return { professor, stock, profBackendId: p._id };
        })
        .filter(Boolean) as any[];
    }
    return localProfessors.map((p) => ({
      professor: p,
      stock: localStocks.get(p.id)!,
      profBackendId: p.id,
    }));
  })();

  const filteredItems = displayItems.filter((item) => {
    if (selectedDepartment !== "all" && item.professor.department !== selectedDepartment) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.professor.name.toLowerCase().includes(q) ||
        item.professor.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const balance = user?.balance ?? 10000;
  const portfolioValue = user?.portfolioValue ?? balance;
  const totalStocksOwned = user?.stocksOwned?.length || 0;
  const totalPL = portfolioValue - 10000;

  const portfolio = {
    cash: balance,
    holdings: (user?.stocksOwned || []).map((h: any) => ({
      professorId: h.professorId,
      shares: h.shares,
      avgCost: h.averageBuyPrice || 0,
    })),
  };

  const getModalPrice = () => {
    if (useBackend && selectedBackendStock) return selectedBackendStock.currentPrice;
    if (selectedLocalProfId) return localStocks.get(selectedLocalProfId)?.price ?? 0;
    return 0;
  };

  const getModalName = () => {
    if (useBackend && selectedProfessor) return selectedProfessor.name;
    if (selectedLocalProfId) return localProfessors.find((p) => p.id === selectedLocalProfId)?.name ?? "";
    return "";
  };

  const getModalAvgBuy = () => {
    const id = useBackend ? selectedProfessor?._id : selectedLocalProfId;
    return id ? getUserAverageBuyPrice(id) : 0;
  };

  const getModalProfId = () => {
     if (useBackend && selectedProfessor) return selectedProfessor._id;
     if (selectedLocalProfId) return selectedLocalProfId;
     return "";
  };

  // ─── Loading states ──────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading market data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TickerBar stocks={tickerStocksMap} />

      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              <span className="text-accent">Prof</span>Exchange
            </h1>
            <p className="text-sm text-muted-foreground">
              Trade professors like stocks. Powered by student sentiment.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hey, <span className="text-foreground font-medium">{user.name}</span>
            </span>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
              <div className="font-mono font-bold text-lg">${portfolioValue.toFixed(2)}</div>
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground font-medium mb-1">Account Balance</p>
            <p className="text-2xl font-mono font-bold text-accent">${balance.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground font-medium mb-1">Portfolio Value</p>
            <p className={`text-2xl font-mono font-bold ${totalPL >= 0 ? "text-gain" : "text-loss"}`}>
              ${portfolioValue.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground font-medium mb-1">Stocks Owned</p>
            <p className="text-2xl font-mono font-bold text-foreground">{totalStocksOwned}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-loss/10 border border-loss/20 text-loss p-4 mb-6 text-sm">{error}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Market area */}
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-4">Trade Professors</h2>

            {/* Search + Filter */}
            <div className="rounded-xl border border-border bg-card p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Search Professors</label>
                  <input
                    type="text"
                    placeholder="Search by name or department…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Filter by Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  >
                    <option value="all">All Departments</option>
                    {getAllDepartments().map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Showing {filteredItems.length} of {displayItems.length} professors
            </p>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-border bg-card">
                <p className="text-muted-foreground">
                  {displayItems.length === 0
                    ? "No professors available for trading yet."
                    : "No professors match your search. Try adjusting your criteria."}
                </p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item, i) => (
                  <motion.div
                    key={item.profBackendId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProfessorCard
                      professor={item.professor}
                      stock={item.stock}
                      userShares={getUserShares(item.profBackendId)}
                      userBalance={balance}
                      onBuyClick={() => handleBuyClick(item.profBackendId, item.stock)}
                      onSellClick={() => handleSellClick(item.profBackendId, item.stock, getUserShares(item.profBackendId))}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 xl:w-96">
            <PortfolioPanel
              portfolio={portfolio}
              stocks={tickerStocksMap}
              totalValue={portfolioValue}
              totalPL={totalPL}
            />
          </div>
        </div>
      </main>

      {/* Buy Modal */}
      {buyModalOpen && (
         <BuyModal
           professorId={getModalProfId()}
           professorName={getModalName()}
           stockPrice={getModalPrice()}
           userBalance={balance}
           isOpen={buyModalOpen}
           isLoading={transactionLoading}
           overallScore={selectedProfessor?.overallScore}
           rmpScore={selectedProfessor?.rmpScore}
           setScore={selectedProfessor?.setScore}
           redditScore={selectedProfessor?.redditScore}
           onClose={closeModals}
           onConfirm={handleBuyConfirm}
         />
      )}

      {/* Sell Modal */}
      {sellModalOpen && (
         <SellModal
           professorId={getModalProfId()}
           professorName={getModalName()}
           stockPrice={getModalPrice()}
           userShares={selectedProfessorShares}
           averageBuyPrice={getModalAvgBuy()}
           isOpen={sellModalOpen}
           isLoading={transactionLoading}
           overallScore={selectedProfessor?.overallScore}
           rmpScore={selectedProfessor?.rmpScore}
           setScore={selectedProfessor?.setScore}
           redditScore={selectedProfessor?.redditScore}
           onClose={closeModals}
           onConfirm={handleSellConfirm}
         />
      )}
    </div>
  );
};

export default Dashboard;