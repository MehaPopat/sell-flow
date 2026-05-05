import { useState } from "react";
import type { BondOrder, Holding } from "@/types";


interface SellModalProps {
  order: BondOrder;
  holding: Holding;
  onClose: () => void;
  onConfirm: () => void;
}

export function SellModal({ order, holding, onClose, onConfirm }: SellModalProps) {
  const [units, setUnits] = useState("");
  const [desiredYield, setDesiredYield] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const yieldMatch = holding.bondName.match(/(\d+\.\d+)%/);
  const purchaseYield = yieldMatch ? parseFloat(yieldMatch[1]) : null;

  const unitsNum = Number(units);
  const yieldNum = Number(desiredYield);

  const unitsError = (() => {
    if (units === "") return null;
    if (unitsNum < 1) return "Units must be at least 1.";
    if (unitsNum > order.available) return `Cannot exceed available units (${order.available}).`;
    return null;
  })();

  const yieldError = (() => {
    if (desiredYield === "") return null;
    if (yieldNum < 0 || yieldNum > 100) return "Yield must be between 0% and 100%.";
    if (purchaseYield !== null) {
      if (yieldNum < purchaseYield - 10 || yieldNum > purchaseYield + 10)
        return `Yield must be within ±10% of purchase yield (${purchaseYield}%).`;
    }
    return null;
  })();

  const canSubmit =
    units !== "" &&
    unitsNum >= 1 &&
    unitsNum <= order.available &&
    desiredYield !== "" &&
    !yieldError &&
    confirmed;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-base">Sell LiquiBonds Holdings</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Order reference */}
            <p className="text-sm">
              Sell from order <span className="font-bold">{order.orderId}</span>
            </p>

            {/* Bond details */}
            <div className="bg-muted rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold">{holding.bondName}</p>
              <p className="text-xs text-muted-foreground font-mono">{holding.isin}</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Purchased: {order.purchasedDate}&nbsp;&nbsp;&nbsp;Price: ₹{order.price.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Units: {order.total}&nbsp;&nbsp;&nbsp;Available: {order.available}&nbsp;&nbsp;&nbsp;Sold: {order.sold}
              </p>
              {purchaseYield !== null && (
                <p className="text-xs mt-1">
                  Purchase Yield:{" "}
                  <span className="font-semibold text-success">{purchaseYield}%</span>
                </p>
              )}
            </div>

            {/* Units to sell */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium block">
                Units to Sell (Available {order.available})
              </label>
              <input
                type="number"
                min={1}
                max={order.available}
                placeholder={`1 – ${order.available}`}
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${unitsError ? "border-destructive" : "border-input"}`}
              />
              {unitsError && (
                <p className="text-xs text-destructive">{unitsError}</p>
              )}
            </div>

            {/* Desired yield */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium block">Desired Yield (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder={purchaseYield !== null ? `e.g. ${purchaseYield} (±10 allowed)` : "e.g. 9.25"}
                value={desiredYield}
                onChange={(e) => setDesiredYield(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${yieldError ? "border-destructive" : "border-input"}`}
              />
              {yieldError && (
                <p className="text-xs text-destructive">{yieldError}</p>
              )}
            </div>

            {/* Confirm checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I confirm that the above details are correct. I understand that sell orders are
                subject to market conditions and negotiation with buyer. I agree to the Terms of
                Service and understand the T-day termination policy.
              </span>
            </label>

            {/* Submit */}
            <button
              className="action-btn action-btn-primary w-full py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!canSubmit}
              onClick={onConfirm}
            >
              Confirm Sell Request
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
