import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import StockChart from "./StockChart";

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
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const totalProceeds = quantity * stockPrice;
  const totalCost = quantity * averageBuyPrice;
  const gainLoss = totalProceeds - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  const isProfit = gainLoss >= 0;

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    setError("");
    if (num < 0) { setError("Quantity must be positive"); return; }
    if (num > userShares) { setError(`You only own ${userShares} shares`); setQuantity(userShares); return; }
    setQuantity(num);
  };

  const handleConfirm = async () => {
    if (quantity < 1) { setError("Quantity must be at least 1"); return; }
    if (quantity > userShares) { setError(`You only own ${userShares} shares`); return; }
    try {
      await onConfirm(quantity);
      setQuantity(1);
      setError("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl border-loss/30 p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-red-600 to-red-800 p-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
            <DialogTitle className="text-white font-bold text-2xl">Sell Shares</DialogTitle>
          </div>
          <DialogDescription className="text-red-100">{professorName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row max-h-[70vh] overflow-y-auto">
          {/* Left Column: Chart */}
          <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-border">
             <p className="text-sm font-semibold text-muted-foreground mb-4">Price History</p>
             <StockChart professorId={professorId} />
          </div>

          {/* Right Column: Form & Stats */}
          <div className="md:w-1/2 p-6 space-y-4">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Current Price per Share</p>
              <p className="text-2xl font-mono font-bold text-loss">${stockPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your Avg Buy Price: <span className="font-mono">${averageBuyPrice.toFixed(2)}</span>
              </p>
            </div>

            {/* Professor Scores (from original DHACKS26) */}
            {(overallScore != null || rmpScore != null || setScore != null || redditScore != null) && (
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm font-semibold text-accent mb-2">Professor Scores</p>
                <div className="space-y-1">
                  {overallScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall</span>
                      <span className="font-bold text-foreground">{overallScore.toFixed(2)}</span>
                    </div>
                  )}
                  {rmpScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">RMP</span>
                      <span className="font-semibold text-foreground">{rmpScore.toFixed(2)}</span>
                    </div>
                  )}
                  {setScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SET</span>
                      <span className="font-semibold text-foreground">{setScore.toFixed(2)}</span>
                    </div>
                  )}
                  {redditScore != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reddit Sentiment</span>
                      <span className="font-semibold text-foreground">{redditScore.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Number of Shares</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min={1}
                max={userShares}
                disabled={isLoading}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 font-mono text-foreground focus:ring-2 focus:ring-loss focus:border-transparent outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">You own: {userShares} shares</p>
            </div>

            <div className="rounded-lg bg-secondary p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-mono font-semibold">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Share</span>
                <span className="font-mono font-semibold">${stockPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-bold">Total Proceeds</span>
                <span className="font-mono font-bold text-lg text-gain">${totalProceeds.toFixed(2)}</span>
              </div>
            </div>

            <div className={`rounded-lg p-3 space-y-2 text-sm ${isProfit ? "bg-gain/10" : "bg-loss/10"}`}>
              <p className={`font-medium ${isProfit ? "text-gain" : "text-loss"}`}>Gain/Loss Analysis</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Basis</span>
                <span className="font-mono font-semibold">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proceeds</span>
                <span className="font-mono font-semibold">${totalProceeds.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold pt-1 border-t ${isProfit ? "border-gain/20" : "border-loss/20"}`}>
                <span>Gain/Loss</span>
                <span className={isProfit ? "text-gain" : "text-loss"}>
                  {isProfit ? "+" : ""}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-accent/10 p-3 space-y-1 text-sm">
              <p className="text-muted-foreground font-medium">After Sale</p>
              <p className="text-lg font-mono font-bold text-accent">{userShares - quantity} shares remaining</p>
              <p className="text-muted-foreground">
                Est. value: <span className="font-mono">${((userShares - quantity) * stockPrice).toFixed(2)}</span>
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-loss/10 text-loss p-3 text-sm font-medium">{error}</div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 gap-2 sm:gap-2 bg-background">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || quantity < 1 || quantity > userShares}
            className="flex-1 rounded-lg bg-loss px-4 py-2 text-sm font-bold text-destructive-foreground hover:bg-loss/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing…" : "Confirm Sale"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellModal;