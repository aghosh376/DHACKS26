import { FC, useState } from 'react';
import StockChart from './StockChart';

interface SellModalProps {
  professorId: string;
  professorName: string;
  stockPrice: number;
  userShares: number;
  averageBuyPrice: number;
  isOpen: boolean;
  isLoading: boolean;
  overallScore?: number;
  rmpScore?: number;
  setScore?: number;
  redditScore?: number;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

const SellModal: FC<SellModalProps> = ({
  professorId,
  professorName,
  stockPrice,
  userShares,
  averageBuyPrice,
  isOpen,
  isLoading,
  overallScore,
  rmpScore,
  setScore,
  redditScore,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const totalProceeds = quantity * stockPrice;
  const totalCost = quantity * averageBuyPrice;
  const gainLoss = totalProceeds - totalCost;
  const gainLossPercent = ((gainLoss / totalCost) * 100) || 0;

  const handleQuantityChange = (value: string): void => {
    const num = parseInt(value) || 0;
    setError('');

    if (num < 0) {
      setError('Quantity must be positive');
      return;
    }

    if (num > userShares) {
      setError(`You only own ${userShares} shares`);
      setQuantity(userShares);
      return;
    }

    setQuantity(num);
  };

  const handleConfirm = async (): Promise<void> => {
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantity > userShares) {
      setError(`You only own ${userShares} shares`);
      return;
    }

    try {
      await onConfirm(quantity);
      setQuantity(1);
      setError('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
          <h2 className="text-2xl font-bold">Sell Stocks</h2>
          <p className="text-red-100">{professorName}</p>
        </div>

        {/* Content — chart + form side by side */}
        <div className="flex flex-col md:flex-row">
          {/* Chart */}
          <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Price History</p>
            <StockChart professorId={professorId} />
          </div>

          {/* Form */}
          <div className="md:w-1/2 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Price Info */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Current Price per Share</p>
              <p className="text-2xl font-bold text-red-600">${stockPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Your Average Buy Price: ${averageBuyPrice.toFixed(2)}
              </p>
            </div>

            {/* Professor Scores */}
            {(overallScore != null || rmpScore != null || setScore != null || redditScore != null) && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-indigo-800 mb-2">Professor Scores</p>
                <div className="space-y-1">
                  {overallScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overall</span>
                      <span className="font-bold text-indigo-700">{overallScore.toFixed(2)}</span>
                    </div>
                  )}
                  {rmpScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">RMP</span>
                      <span className="font-semibold text-gray-800">{rmpScore.toFixed(2)}</span>
                    </div>
                  )}
                  {setScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SET</span>
                      <span className="font-semibold text-gray-800">{setScore.toFixed(2)}</span>
                    </div>
                  )}
                  {redditScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reddit Sentiment</span>
                      <span className="font-semibold text-gray-800">{redditScore.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Shares
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min="1"
                max={userShares}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">You own: {userShares} shares</p>
            </div>

            {/* Sale Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold">{quantity} shares</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Price per Share</span>
                <span className="font-semibold">${stockPrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold text-gray-800">Total Proceeds</span>
                <span className="text-lg font-bold text-green-600">
                  ${totalProceeds.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Gain/Loss Analysis */}
            <div className={`p-3 rounded-lg ${
              gainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`text-sm font-medium ${
                gainLoss >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                Gain/Loss Analysis
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost Basis (this sale)</span>
                  <span className="font-semibold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Proceeds (this sale)</span>
                  <span className="font-semibold">${totalProceeds.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between text-sm font-bold pt-1 border-t ${
                  gainLoss >= 0 ? 'border-green-200' : 'border-red-200'
                }`}>
                  <span>Gain/Loss</span>
                  <span className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {gainLoss >= 0 ? '+' : ''} ${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Remaining Holdings */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">After Sale</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {userShares - quantity} shares remaining
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Estimated value: ${((userShares - quantity) * stockPrice).toFixed(2)}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || quantity < 1 || quantity > userShares}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {isLoading ? 'Processing...' : 'Confirm Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
