import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BuyModalProps {
  professorName: string;
  stockPrice: number;
  userBalance: number;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

const BuyModal: FC<BuyModalProps> = ({
  professorName,
  stockPrice,
  userBalance,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const totalCost = quantity * stockPrice;
  const maxAffordable = Math.floor(userBalance / stockPrice);

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    setError("");
    if (num < 0) { setError("Quantity must be positive"); return; }
    if (num > maxAffordable) { setError(`You can only afford ${maxAffordable} shares`); setQuantity(maxAffordable); return; }
    setQuantity(num);
  };

  const handleConfirm = async () => {
    if (quantity < 1) { setError("Quantity must be at least 1"); return; }
    if (totalCost > userBalance) { setError("Insufficient balance"); return; }
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
      <DialogContent className="sm:max-w-md border-gain/30">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gain animate-pulse" />
            <DialogTitle className="text-gain font-bold">Buy Shares</DialogTitle>
          </div>
          <DialogDescription>{professorName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Price per Share</p>
            <p className="text-2xl font-mono font-bold text-gain">${stockPrice.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Number of Shares</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              min={1}
              max={maxAffordable}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-muted px-4 py-2 font-mono text-foreground focus:ring-2 focus:ring-gain focus:border-transparent outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Max affordable: {maxAffordable} shares</p>
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
              <span className="font-bold">Total Cost</span>
              <span className={`font-mono font-bold text-lg ${totalCost <= userBalance ? "text-gain" : "text-loss"}`}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-accent/10 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-mono font-bold text-accent">${userBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">After Purchase</span>
              <span className={`font-mono font-bold ${userBalance - totalCost >= 0 ? "text-gain" : "text-loss"}`}>
                ${(userBalance - totalCost).toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-loss/10 text-loss p-3 text-sm font-medium">{error}</div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || totalCost > userBalance || quantity < 1}
            className="flex-1 rounded-lg bg-gain px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-gain/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing…" : "Confirm Purchase"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;
