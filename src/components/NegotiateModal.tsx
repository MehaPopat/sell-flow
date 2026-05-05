import { useEffect, useState } from "react";
import type { NegotiationDetail, SellRequest } from "@/types";
import { fetchNegotiationDetail } from "@/services/api";

interface NegotiateModalProps {
  request: SellRequest;
  onClose: () => void;
  onSuccess: (action: "counter" | "accept" | "reject") => void;
}

type View = "main" | "counter" | "accept" | "reject";

export function NegotiateModal({ request, onClose, onSuccess }: NegotiateModalProps) {
  const [detail, setDetail] = useState<NegotiationDetail | null>(null);
  const [view, setView] = useState<View>("main");
  const [counterYield, setCounterYield] = useState("");
  const [yieldError, setYieldError] = useState("");
  const [counterRemark, setCounterRemark] = useState("");
  const [acceptRemark, setAcceptRemark] = useState("");
  const [rejectRemark, setRejectRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNegotiationDetail(request.requestId).then((d) => setDetail(d ?? null));
  }, [request.requestId]);

  const lastRound = detail?.rounds[detail.rounds.length - 1];
  const buyerRound = lastRound?.party === "Buyer" ? lastRound : null;

  const purchaseYield = detail?.purchaseYield ?? null;
  const minYield = purchaseYield !== null ? Math.max(0, purchaseYield - 10) : 0;
  const maxYield = purchaseYield !== null ? Math.min(100, purchaseYield + 10) : 100;

  function handleCounterYieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCounterYield(value);
    if (value === "") { setYieldError(""); return; }
    const num = Number(value);
    if (num < minYield || num > maxYield) {
      setYieldError(`Value must be between ${minYield.toFixed(2)} and ${maxYield.toFixed(2)}`);
    } else {
      setYieldError("");
    }
  }

  async function handleSubmit(action: "counter" | "accept" | "reject") {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onSuccess(action);
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={view === "main" ? onClose : undefined}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-border shrink-0">
            <div>
              <h2 className="font-semibold text-base">
                {view === "main"    ? `Negotiate — ${request.requestId}`
                : view === "counter" ? "Submit Counter Quote"
                : view === "accept"  ? "Accept Quote"
                :                     "Reject Quote"}
              </h2>
              {detail && view === "main" && (
                <p className="text-xs text-muted-foreground mt-0.5">{detail.fullBondName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none ml-4 shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {!detail ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                {/* Details card */}
                <div className="bg-muted rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bond Name</span>
                    <span className="font-medium text-right max-w-[60%]">{detail.fullBondName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ISIN</span>
                    <span className="font-mono text-xs font-medium">{detail.isin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units</span>
                    <span className="font-medium">{request.units}</span>
                  </div>
                  {detail.purchaseYield !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Yield</span>
                      <span className="font-semibold text-success">{detail.purchaseYield}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Desired Yield</span>
                    <span className="font-medium">{request.yield}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Settlement Date</span>
                    <span className="font-medium">{request.settlementDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Settlement Bank</span>
                    <span className="font-medium text-right">{detail.settlementBank}</span>
                  </div>
                </div>

                {/* Negotiation History */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Negotiation History</h3>
                  <div className="space-y-3">
                    {detail.rounds.map((r) => (
                      <div
                        key={r.round}
                        className={`rounded-xl p-4 border ${
                          r.party === "You"
                            ? "bg-blue-50 border-blue-100"
                            : "bg-orange-50 border-orange-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Round {r.round}</span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                r.party === "You"
                                  ? "bg-blue-200 text-blue-700"
                                  : "bg-orange-200 text-orange-700"
                              }`}
                            >
                              {r.party}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                        </div>
                        <p className="text-sm">
                          Yield: <span className="font-semibold">{r.yield}%</span>
                          &nbsp;&nbsp;&nbsp;
                          Price: <span className="font-semibold">₹{r.price}</span>
                        </p>
                        <p className="text-xs text-muted-foreground italic mt-1">"{r.remark}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── MAIN: Respond section ── */}
                {view === "main" && buyerRound && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm">Respond to Buyer's Quote</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Buyer proposed{" "}
                        <span className="font-semibold">{buyerRound.yield}%</span> yield at{" "}
                        <span className="font-semibold">₹{buyerRound.price}</span>. Choose to accept,
                        reject, or counter.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setView("accept")}
                        className="action-btn flex-1 rounded-xl py-2.5 text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => setView("reject")}
                        className="action-btn flex-1 rounded-xl py-2.5 text-sm font-semibold border-red-300 bg-red-600 text-white hover:bg-red-60 transition"
                      >
                        × Reject
                      </button>
                      <button
                        onClick={() => setView("counter")}
                        className="action-btn flex-1 rounded-xl py-2.5 text-sm font-semibold bg-accent text-white hover:opacity-90 transition"
                      >
                        ↺ Counter
                      </button>
                    </div>
                  </div>
                )}

                {/* ── COUNTER form ── */}
                {view === "counter" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Submit Counter Quote</h3>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">Your Yield (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min={minYield}
                        max={maxYield}
                        placeholder={`e.g. ${minYield.toFixed(2)} - ${maxYield.toFixed(2)}`}
                        value={counterYield}
                        onChange={handleCounterYieldChange}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${yieldError ? "border-destructive" : "border-input"}`}
                      />
                      {yieldError && <p className="text-xs text-destructive">{yieldError}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">Remark (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Add a note for your counter quote..."
                        value={counterRemark}
                        onChange={(e) => setCounterRemark(e.target.value)}
                        className="w-full rounded-lg border border-input px-3 py-2 text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setView("main")}
                        className="action-btn action-btn-secondary flex-1 py-3 text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleSubmit("counter")}
                        disabled={!counterYield || !!yieldError || submitting}
                        className="action-btn action-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {submitting ? "Submitting…" : "Submit Counter Quote"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ACCEPT form ── */}
                {view === "accept" && buyerRound && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm">Accept Quote</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You are accepting the buyer's quote of{" "}
                        <span className="font-semibold">{buyerRound.yield}%</span> yield at{" "}
                        <span className="font-semibold">₹{buyerRound.price}</span>.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">Remark (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Add a note for this acceptance..."
                        value={acceptRemark}
                        onChange={(e) => setAcceptRemark(e.target.value)}
                        className="w-full rounded-lg border border-input px-3 py-2 text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setView("main")}
                        className="action-btn action-btn-secondary flex-1 py-3 text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleSubmit("accept")}
                        disabled={submitting}
                        className="action-btn flex-1 py-3 text-sm rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-40"
                      >
                        {submitting ? "Submitting…" : "Confirm Accept"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── REJECT form ── */}
                {view === "reject" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm">Reject Quote</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Are you sure you want to reject this quote? This will close the negotiation.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">Remark (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Add a reason for rejection..."
                        value={rejectRemark}
                        onChange={(e) => setRejectRemark(e.target.value)}
                        className="w-full rounded-lg border border-input px-3 py-2 text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setView("main")}
                        className="action-btn action-btn-secondary flex-1 py-3 text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleSubmit("reject")}
                        disabled={submitting}
                        className="action-btn flex-1 py-3 text-sm rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-40"
                      >
                        {submitting ? "Submitting…" : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
