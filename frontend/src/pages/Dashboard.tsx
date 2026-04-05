import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorCard from '../components/ProfessorCard';
import BuyModal from '../components/BuyModal';
import SellModal from '../components/SellModal';

interface User {
  name: string;
  email: string;
  balance?: number;
  portfolioValue?: number;
  stocksOwned?: Array<{
    professorId: string;
    shares: number;
    costBasis: number;
    averageBuyPrice: number;
  }>;
  [key: string]: any;
}

interface Stock {
  _id: string;
  professorId: string;
  currentPrice: number;
  percentChange24h: number;
  volume24h: number;
}

interface Professor {
  _id: string;
  name: string;
  department: string;
  email?: string;
  imageUrl?: string;
  currScore?: number;
}

interface DashboardProps {
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const Dashboard: FC<DashboardProps> = ({ user, setToken, setUser }: DashboardProps) => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [transactionLoading, setTransactionLoading] = useState(false);

  // Modal states
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedProfessorShares, setSelectedProfessorShares] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        // Fetch stocks - includes populated professor data
        const stocksRes = await fetch('/api/stocks', { headers });
        if (!stocksRes.ok) throw new Error('Failed to fetch stocks');
        const stocksData = await stocksRes.json();
        setStocks(stocksData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getUserShares = (professorId: string | { _id: string }): number => {
    const id = typeof professorId === 'string' ? professorId : professorId._id;
    return (
      user?.stocksOwned?.find((holding) => holding.professorId === id)?.shares || 0
    );
  };

  const getUserAverageBuyPrice = (professorId: string | { _id: string }): number => {
    const id = typeof professorId === 'string' ? professorId : professorId._id;
    return (
      user?.stocksOwned?.find((holding) => holding.professorId === id)
        ?.averageBuyPrice || 0
    );
  };

  const handleBuyClick = (professorId: string, stock: Stock): void => {
    // Find professor from stock data
    const professorData = stock.professorId as any;
    if (professorData && professorData._id) {
      const professor: Professor = {
        _id: professorData._id,
        name: professorData.name || 'Unknown',
        department: professorData.department || 'N/A',
        email: professorData.email,
        imageUrl: professorData.imageUrl,
        currScore: professorData.currScore,
      };
      setSelectedProfessor(professor);
      setSelectedStock(stock);
      setBuyModalOpen(true);
    }
  };

  const handleSellClick = (professorId: string, stock: Stock, shares: number): void => {
    // Find professor from stock data
    const professorData = stock.professorId as any;
    if (professorData && professorData._id) {
      const professor: Professor = {
        _id: professorData._id,
        name: professorData.name || 'Unknown',
        department: professorData.department || 'N/A',
        email: professorData.email,
        imageUrl: professorData.imageUrl,
        currScore: professorData.currScore,
      };
      setSelectedProfessor(professor);
      setSelectedStock(stock);
      setSelectedProfessorShares(shares);
      setSellModalOpen(true);
    }
  };

  const handleBuyConfirm = async (quantity: number): Promise<void> => {
    if (!selectedProfessor || !selectedStock || !token) return;

    try {
      setTransactionLoading(true);
      const response = await fetch(`/api/stocks/${selectedProfessor._id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to buy stocks');
      }

      const result = await response.json();

      // Update user data
      if (result.data?.user) {
        const updatedUser = {
          ...user,
          balance: parseFloat(result.data.user.newBalance),
          portfolioValue: parseFloat(result.data.user.portfolioValue),
          stocksOwned: user?.stocksOwned || [],
        };

        const existingHolding = updatedUser.stocksOwned?.find(
          (h) => h.professorId === selectedProfessor._id
        );
        if (existingHolding) {
          existingHolding.shares = result.data.user.holdings.shares;
          existingHolding.averageBuyPrice = result.data.user.holdings.averageBuyPrice;
        } else {
          updatedUser.stocksOwned?.push({
            professorId: selectedProfessor._id,
            shares: quantity,
            costBasis: result.data.transaction.totalAmount,
            averageBuyPrice: result.data.transaction.pricePerShare,
          });
        }

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Update stock data
      setStocks((prevStocks) =>
        prevStocks.map((s) =>
          s._id === selectedStock._id
            ? { ...s, currentPrice: parseFloat(result.data.stock.newPrice) }
            : s
        )
      );

      alert(`Successfully bought ${quantity} shares!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      alert(`Purchase failed: ${message}`);
      throw err;
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleSellConfirm = async (quantity: number): Promise<void> => {
    if (!selectedProfessor || !selectedStock || !token) return;

    try {
      setTransactionLoading(true);
      const response = await fetch(`/api/stocks/${selectedProfessor._id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sell stocks');
      }

      const result = await response.json();

      // Update user data
      if (result.data?.user) {
        const updatedUser = {
          ...user,
          balance: parseFloat(result.data.user.newBalance),
          portfolioValue: parseFloat(result.data.user.portfolioValue),
          stocksOwned: user?.stocksOwned || [],
        };

        const holdingIndex = updatedUser.stocksOwned?.findIndex(
          (h) => h.professorId === selectedProfessor._id
        );
        if (holdingIndex !== undefined && holdingIndex !== -1) {
          if (result.data.user.holdings.shares === 0) {
            updatedUser.stocksOwned?.splice(holdingIndex, 1);
          } else {
            updatedUser.stocksOwned![holdingIndex].shares = result.data.user.holdings.shares;
          }
        }

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Update stock data
      setStocks((prevStocks) =>
        prevStocks.map((s) =>
          s._id === selectedStock._id
            ? { ...s, currentPrice: parseFloat(result.data.stock.newPrice) }
            : s
        )
      );

      alert(`Successfully sold ${quantity} shares!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      alert(`Sale failed: ${message}`);
      throw err;
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleLogout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalStocksOwned = user?.stocksOwned?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-900">Professor Stock Market</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Card */}
        <div className="lg:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-indigo-100">Email: {user.email}</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Account Balance</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${(user.balance || 10000).toFixed(2)}
                </p>
              </div>
              <div className="text-5xl text-indigo-200">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Portfolio Value</p>
                <p className="text-3xl font-bold text-green-600">
                  ${(user.portfolioValue || user.balance || 10000).toFixed(2)}
                </p>
              </div>
              <div className="text-5xl text-green-200">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Stocks Owned</p>
                <p className="text-3xl font-bold text-blue-600">{totalStocksOwned}</p>
              </div>
              <div className="text-5xl text-blue-200">📊</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Trading Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Trade Professors</h3>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading professors and stocks...</p>
            </div>
          ) : stocks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No professors available for trading yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => {
                // Extract professor data from populated professorId
                const professorData = stock.professorId as any;
                if (!professorData || !professorData._id) return null;

                const professor: Professor = {
                  _id: professorData._id,
                  name: professorData.name || 'Unknown',
                  department: professorData.department || 'N/A',
                  email: professorData.email,
                  imageUrl: professorData.imageUrl,
                  currScore: professorData.currScore,
                };

                const userShares = getUserShares(professorData._id);

                return (
                  <ProfessorCard
                    key={stock._id}
                    professor={professor}
                    stock={stock}
                    userShares={userShares}
                    userBalance={user.balance || 0}
                    onBuyClick={handleBuyClick}
                    onSellClick={handleSellClick}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {selectedProfessor && selectedStock && (
        <BuyModal
          professorName={selectedProfessor.name}
          stockPrice={selectedStock.currentPrice}
          userBalance={user.balance || 0}
          isOpen={buyModalOpen}
          isLoading={transactionLoading}
          onClose={() => {
            setBuyModalOpen(false);
            setSelectedProfessor(null);
            setSelectedStock(null);
          }}
          onConfirm={handleBuyConfirm}
        />
      )}

      {/* Sell Modal */}
      {selectedProfessor && selectedStock && (
        <SellModal
          professorName={selectedProfessor.name}
          stockPrice={selectedStock.currentPrice}
          userShares={selectedProfessorShares}
          averageBuyPrice={getUserAverageBuyPrice(selectedProfessor._id)}
          isOpen={sellModalOpen}
          isLoading={transactionLoading}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedProfessor(null);
            setSelectedStock(null);
          }}
          onConfirm={handleSellConfirm}
        />
      )}
    </div>
  );
};

export default Dashboard;
