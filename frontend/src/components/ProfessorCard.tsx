import { FC } from 'react';

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

interface ProfessorCardProps {
  professor: Professor;
  stock: Stock;
  userShares?: number;
  userBalance?: number;
  onBuyClick: (professorId: string, stock: Stock) => void;
  onSellClick: (professorId: string, stock: Stock, userShares: number) => void;
}

const ProfessorCard: FC<ProfessorCardProps> = ({
  professor,
  stock,
  userShares = 0,
  userBalance = 0,
  onBuyClick,
  onSellClick,
}) => {
  const priceChangeColor = stock.percentChange24h >= 0 ? 'text-green-600' : 'text-red-600';
  const priceChangeBg = stock.percentChange24h >= 0 ? 'bg-green-50' : 'bg-red-50';
  const priceChangeArrow = stock.percentChange24h >= 0 ? '↑' : '↓';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Card Content */}
      <div className="p-6">
        {/* Professor Info */}
        <h3 className="text-xl font-bold text-gray-800 mb-1">{professor.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{professor.department}</p>
        {professor.currScore && (
          <p className="text-xs text-gray-500 mb-4">Rating: {professor.currScore.toFixed(2)}/5</p>
        )}

        {/* Price Section */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-semibold mb-1">Stock Price</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-indigo-600">${stock.currentPrice.toFixed(2)}</p>
            <div className={`text-sm font-semibold p-1 px-2 rounded ${priceChangeBg} ${priceChangeColor}`}>
              {priceChangeArrow} {Math.abs(stock.percentChange24h).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* User Holdings */}
        {userShares > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold mb-1">Your Holdings</p>
            <p className="text-lg font-bold text-blue-600">{userShares} shares</p>
            <p className="text-sm text-gray-600">
              Value: ${(userShares * stock.currentPrice).toFixed(2)}
            </p>
          </div>
        )}

        {/* Volume Info */}
        <p className="text-xs text-gray-500 mb-4">24h Volume: {stock.volume24h} shares</p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onBuyClick(professor._id, stock)}
            disabled={userBalance < stock.currentPrice}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            title={userBalance < stock.currentPrice ? 'Insufficient balance' : 'Buy stocks'}
          >
            Buy
          </button>
          <button
            onClick={() => onSellClick(professor._id, stock, userShares)}
            disabled={userShares === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            title={userShares === 0 ? 'You don\'t own any shares' : 'Sell stocks'}
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
