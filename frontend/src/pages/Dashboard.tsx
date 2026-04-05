import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  [key: string]: any;
}

interface DashboardProps {
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const Dashboard: FC<DashboardProps> = ({ user, setToken, setUser }: DashboardProps) => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
            <p className="text-indigo-100">Email: {user.email}</p>
          </div>

          {/* User Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Account Balance</p>
                <p className="text-3xl font-bold text-indigo-600">$10,000</p>
              </div>
              <div className="text-5xl text-indigo-200">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Portfolio Value</p>
                <p className="text-3xl font-bold text-green-600">$10,000</p>
              </div>
              <div className="text-5xl text-green-200">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Stocks Owned</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="text-5xl text-blue-200">📊</div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">📈 Trade Professors</p>
                <p className="text-sm text-gray-600">Buy and sell stocks of your favorite professors</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">🏆 Leaderboard</p>
                <p className="text-sm text-gray-600">Compete with other traders</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">💹 Market Stats</p>
                <p className="text-sm text-gray-600">View real-time market trends</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">⚙️ Settings</p>
                <p className="text-sm text-gray-600">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
