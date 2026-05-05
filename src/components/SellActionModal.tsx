import { useState } from "react";
import type { SellRequest, SellRequestStatus } from "@/types";

export type SellActionType = "reject" | "cancel" | "view" | "dis" | "approve";

interface SellActionModalProps {
  request: SellRequest;
  type: SellActionType;
  onClose: () => void;
  onSuccess?: (type: SellActionType) => void;
}

function statusBadgeClass(status: SellRequestStatus): string {
  switch (status) {
    case "Sell Initiated":  return "bg-blue-100 text-blue-700";
    case "Auto Approved":   return "bg-green-100 text-green-700";
    case "Negotiation":     return "bg-amber-100 text-amber-700";
    case "Buyer Approved":  return "bg-green-100 text-green-700";
    case "Seller Approved": return "bg-teal-100 text-teal-700";
    case "Payment Done":    return "bg-cyan-100 text-cyan-700";
    case "Processing":      return "bg-orange-100 text-orange-700";
    case "InProgress":      return "bg-amber-100 text-amber-700";
    case "Settled":         return "bg-emerald-100 text-emerald-700";
    case "Rejected":        return "bg-red-100 text-red-600";
    case "Terminated":      return "bg-red-200 text-red-700";
  }
}

export function SellActionModal({ request, type, onClose, onSuccess }: SellActionModalProps) {
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const title =
    type === "reject"  ? "Reject Proposal" :
    type === "cancel"  ? "Cancel Sell Request" :
    type === "view"    ? "Transaction Details" :
    type === "approve" ? "Approve Proposal" :
                         "Upload DIS Copy";

  async function handleConfirm() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onSuccess?.(type);
  }

  const detailsCard = (
    <div className="bg-muted rounded-xl p-4 space-y-2">
      <p className="text-sm font-semibold">{request.bondName}</p>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Units:</span>
        <span className="font-medium">{request.units}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Yield:</span>
        <span className="font-medium">{request.yield}%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Settlement Date:</span>
        <span className="font-medium">{request.settlementDate}</span>
      </div>
      <div className="flex justify-between text-sm items-center">
        <span className="text-muted-foreground">Status:</span>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusBadgeClass(request.status)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
          {request.status}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto">

          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold text-base">{title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{request.requestId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none ml-4 shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* ── REJECT ── */}
            {type === "reject" && (
              <>
                {detailsCard}
                <p className="text-sm text-muted-foreground">
                  Please provide a reason for rejecting this proposal.
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Remarks (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add any additional remarks..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="action-btn action-btn-secondary flex-1 py-3 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="action-btn flex-1 py-3 text-sm rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-40"
                  >
                    {submitting ? "Submitting…" : "Confirm Reject"}
                  </button>
                </div>
              </>
            )}

            {/* ── APPROVE ── */}
            {type === "approve" && (
              <>
                {detailsCard}
                <p className="text-sm text-muted-foreground">
                  Please confirm your approval for this proposal.
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Remarks (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add any additional remarks..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="action-btn action-btn-secondary flex-1 py-3 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="action-btn flex-1 py-3 text-sm rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-40"
                  >
                    {submitting ? "Submitting…" : "Confirm Approve"}
                  </button>
                </div>
              </>
            )}

            {/* ── CANCEL ── */}
            {type === "cancel" && (
              <>
                {detailsCard}
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to cancel this sell request? This action cannot be undone.
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Remarks (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add any additional remarks..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="action-btn action-btn-secondary flex-1 py-3 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="action-btn action-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? "Submitting…" : "Confirm Cancel"}
                  </button>
                </div>
              </>
            )}

            {/* ── VIEW (Transaction Details) ── */}
            {type === "view" && (
              <>
                {detailsCard}
                <p className="text-sm text-muted-foreground">View the complete transaction details.</p>

                {request.utr && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-700">✅ Trade Settled</p>
                    <p className="text-xs text-muted-foreground mt-2">UTR Number</p>
                    <p className="font-bold text-sm mt-0.5">{request.utr}</p>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Settlement Date:</span>
                    <span className="font-medium">{request.settlementDate}</span>
                  </div>
                  {request.utr && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">UTR Number:</span>
                      <span className="font-medium">{request.utr}</span>
                    </div>
                  )}
                  {request.rfqNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">RFQ Number:</span>
                      <span className="font-medium">{request.rfqNumber}</span>
                    </div>
                  )}
                  {request.tradeNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trade Number:</span>
                      <span className="font-medium">{request.tradeNumber}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Settlement Bank:</span>
                    <span className="font-semibold text-right">HDFC Bank</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground"></span>
                    <span className="font-medium text-muted-foreground">XXXX XXXX 4521</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground"></span>
                    <span className="font-medium text-muted-foreground">HDFC0001234</span>
                  </div>
                </div>

                <button onClick={onClose} className="action-btn action-btn-secondary w-full py-3 text-sm">
                  Close
                </button>
              </>
            )}

            {/* ── DIS Upload ── */}
            {type === "dis" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Upload the Delivery Instruction Slip for sell request{" "}
                  <span className="font-semibold">{request.requestId}</span>. Accepted: PDF, JPG, PNG.
                </p>

                <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-input cursor-pointer hover:border-accent transition-colors bg-muted/50 py-8 gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {file ? (
                    <span className="text-sm font-medium text-accent">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                      <span className="text-xs text-muted-foreground">PDF, JPG, PNG</span>
                    </>
                  )}
                </label>

                <div className="flex gap-3">
                  <button onClick={onClose} className="action-btn action-btn-secondary flex-1 py-3 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!file || submitting}
                    className="action-btn action-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? "Uploading…" : "Upload"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
