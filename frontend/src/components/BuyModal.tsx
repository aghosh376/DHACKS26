import { FC, useState } from 'react';
import StockChart from './StockChart';

interface BuyModalProps {
  professorId: string;
  professorName: string;
  stockPrice: number;
  userBalance: number;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

const BuyModal: FC<BuyModalProps> = ({
  professorId,
  professorName,
  stockPrice,
  userBalance,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const totalCost = quantity * stockPrice;
  const maxAffordable = Math.floor(userBalance / stockPrice);

  const handleQuantityChange = (value: string): void => {
    const num = parseInt(value) || 0;
    setError('');

    if (num < 0) {
      setError('Quantity must be positive');
      return;
    }

    if (num > maxAffordable) {
      setError(`You can only afford ${maxAffordable} shares`);
      setQuantity(maxAffordable);
      return;
    }

    setQuantity(num);
  };

  const handleConfirm = async (): Promise<void> => {
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (totalCost > userBalance) {
      setError('Insufficient balance');
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
          <h2 className="text-2xl font-bold">Buy Stocks</h2>
          <p className="text-green-100">{professorName}</p>
        </div>

        {/* Content — chart + form side by side */}
        <div className="flex flex-col md:flex-row">
          {/* Chart */}
          <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Price History</p>
            <StockChart professorId={professorId} />
          </div>

          {/* Form */}
          <div className="md:w-1/2 p-6 space-y-4">
            {/* Price Info */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Price per Share</p>
              <p className="text-2xl font-bold text-green-600">${stockPrice.toFixed(2)}</p>
            </div>

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
                max={maxAffordable}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Max affordable: {maxAffordable} shares</p>
            </div>

            {/* Cost Summary */}
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
                <span className="font-bold text-gray-800">Total Cost</span>
                <span className={`text-lg font-bold ${
                  totalCost <= userBalance ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Available Balance</span>
                <span className="font-bold text-blue-600">${userBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-700">After Purchase</span>
                <span className={`font-bold ${
                  userBalance - totalCost >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${(userBalance - totalCost).toFixed(2)}
                </span>
              </div>
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
            disabled={isLoading || totalCost > userBalance || quantity < 1}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {isLoading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
