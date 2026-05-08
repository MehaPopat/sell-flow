import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchSellRequests } from "@/services/api";
import type { SellRequest, SellRequestStatus, UserRole } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";
import { NegotiateModal } from "@/components/NegotiateModal";
import { SellActionModal } from "@/components/SellActionModal";
import type { SellActionType } from "@/components/SellActionModal";
import { SuccessModal } from "@/components/SuccessModal";

// ── Flow pipeline display ─────────────────────────────────────────────────────

const AUTO_APPROVED_FLOW: { label: string; color: string }[] = [
  { label: "Sell Initiated",  color: "bg-blue-100 text-blue-700" },
  { label: "Auto Approved",   color: "bg-green-100 text-green-700" },
  { label: "DIS Submitted",   color: "bg-sky-100 text-sky-700" },
  { label: "Payment Done",    color: "bg-cyan-100 text-cyan-700" },
  { label: "Settled",         color: "bg-emerald-100 text-emerald-700" },
];

const NEGOTIATION_FLOW: { label: string; color: string }[] = [
  { label: "Sell Initiated",  color: "bg-blue-100 text-blue-700" },
  { label: "Negotiation",     color: "bg-amber-100 text-amber-700" },
  { label: "Buyer Approved",  color: "bg-green-100 text-green-700" },
  { label: "Seller Approved", color: "bg-teal-100 text-teal-700" },
  { label: "DIS Submitted",   color: "bg-sky-100 text-sky-700" },
  { label: "Payment Done",    color: "bg-cyan-100 text-cyan-700" },
  { label: "Processing",      color: "bg-orange-100 text-orange-700" },
  { label: "Settled",         color: "bg-emerald-100 text-emerald-700" },
];

const FILTER_TABS: Array<SellRequestStatus | "All"> = [
  "All", "Sell Initiated", "Auto Approved", "Negotiation", "Buyer Approved",
  "Seller Approved", "Payment Done", "Processing", "Settled", "Rejected", "Terminated",
];

// ── Status badge ──────────────────────────────────────────────────────────────

function statusStyle(status: SellRequestStatus): string {
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

// ── Button styles ─────────────────────────────────────────────────────────────

const btn = {
  primary: "rounded-full px-3 py-1.5 text-xs font-semibold bg-accent text-white border border-transparent transition hover:-translate-y-px",
  success: "rounded-full px-3 py-1.5 text-xs font-semibold bg-green-600 text-white border border-transparent transition hover:-translate-y-px",
  danger:  "rounded-full px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-600 bg-transparent hover:bg-red-50 transition",
  ghost:   "rounded-full px-3 py-1.5 text-xs font-semibold border border-input text-muted-foreground bg-transparent hover:text-foreground hover:border-foreground/30 transition",
  warning: "rounded-full px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white border border-transparent transition hover:-translate-y-px",
  muted:   "rounded-full px-3 py-1.5 text-xs font-semibold bg-muted text-muted-foreground cursor-default select-none",
};

// ── Status actions (role-aware) ───────────────────────────────────────────────

interface StatusActionsProps {
  status: SellRequestStatus;
  role: UserRole;
  onNegotiate: () => void;
  onAction: (type: SellActionType) => void;
}

function StatusActions({ status, role, onNegotiate, onAction }: StatusActionsProps) {
  // ── OPS view ──────────────────────────────────────────────────────────────
  if (role === "ops") {
    switch (status) {
      case "Sell Initiated":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.success}  onClick={() => onAction("match")}>✓ Match</button>
            <button className={btn.primary}  onClick={() => onAction("to-negotiation")}>Negotiate</button>
            <button className={btn.danger}   onClick={() => onAction("terminate")}>× Terminate</button>
          </div>
        );
      case "Negotiation":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.success}  onClick={() => onAction("approve")}>✓ Accept (Buyer)</button>
            <button className={btn.danger}   onClick={() => onAction("reject")}>× Reject</button>
            <button className={btn.danger}   onClick={() => onAction("terminate")}>Terminate</button>
          </div>
        );
      case "Buyer Approved":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={btn.muted}>Awaiting Seller</span>
            <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
            <button className={btn.danger} onClick={() => onAction("terminate")}>× Terminate</button>
          </div>
        );
      case "Seller Approved":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.success}  onClick={() => onAction("confirm-payment")}>✓ Confirm Payment</button>
            <button className={btn.ghost}    onClick={() => onAction("dis")}>📎 DIS</button>
            <button className={btn.danger}   onClick={() => onAction("terminate")}>× Terminate</button>
          </div>
        );
      case "Auto Approved":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.success}  onClick={() => onAction("confirm-payment")}>✓ Confirm Payment</button>
            <button className={btn.ghost}    onClick={() => onAction("dis")}>📎 DIS</button>
            <button className={btn.danger}   onClick={() => onAction("terminate")}>× Terminate</button>
          </div>
        );
      case "Payment Done":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.warning}  onClick={() => onAction("to-processing")}>Mark Processing</button>
            <button className={btn.ghost}    onClick={() => onAction("view")}>View</button>
            <button className={btn.danger}   onClick={() => onAction("terminate")}>× Terminate</button>
          </div>
        );
      case "Processing":
      case "InProgress":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.success}  onClick={() => onAction("to-settled")}>✓ Mark Settled</button>
            <button className={btn.ghost}    onClick={() => onAction("view")}>View</button>
            <button className={btn.danger}   onClick={() => onAction("terminate")}>× Terminate</button>
          </div>
        );
      case "Settled":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.ghost}    onClick={() => onAction("view")}>View</button>
            <button className={btn.ghost}    onClick={() => onAction("dis")}>📎 DIS</button>
          </div>
        );
      default:
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
          </div>
        );
    }
  }

  // ── Investor / IFA view ───────────────────────────────────────────────────
  switch (status) {
    case "Sell Initiated":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.danger} onClick={() => onAction("cancel")}>× Cancel</button>
        </div>
      );
    case "Negotiation":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.primary} onClick={onNegotiate}>Negotiate</button>
          <button className={btn.danger}  onClick={() => onAction("reject")}>× Reject</button>
        </div>
      );
    case "Buyer Approved":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.success} onClick={() => onAction("approve")}>✓ Approve</button>
          <button className={btn.danger}  onClick={() => onAction("reject")}>× Reject</button>
        </div>
      );
    case "Seller Approved":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.ghost} onClick={() => onAction("dis")}>📎 Upload DIS</button>
          <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
        </div>
      );
    case "Auto Approved":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.ghost} onClick={() => onAction("dis")}>📎 Upload DIS</button>
          <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
        </div>
      );
    case "Payment Done":
    case "Processing":
    case "InProgress":
      return (
        <div className="flex items-center gap-1.5">
          <span className={btn.muted}>In Progress</span>
          <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
        </div>
      );
    case "Settled":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
          <button className={btn.ghost} onClick={() => onAction("dis")}>📎 DIS</button>
        </div>
      );
    case "Rejected":
    case "Terminated":
      return (
        <div className="flex items-center gap-1.5">
          <button className={btn.ghost} onClick={() => onAction("view")}>View</button>
        </div>
      );
    default:
      return null;
  }
}

// ── Success message copy ──────────────────────────────────────────────────────

function successCopy(type: SellActionType): { title: string; body: string } {
  switch (type) {
    case "reject":           return { title: "Proposal Rejected",       body: "The proposal has been rejected successfully." };
    case "cancel":           return { title: "Request Cancelled",       body: "Your sell request has been cancelled." };
    case "approve":          return { title: "Proposal Approved",       body: "The proposal has been approved. Moving to Seller Approved." };
    case "dis":              return { title: "DIS Uploaded",            body: "Your DIS copy has been uploaded successfully." };
    case "terminate":        return { title: "Request Terminated",      body: "The sell request has been terminated as per the T+1 day policy." };
    case "match":            return { title: "Auto-Approved",           body: "A buyer match was found. The sell request is now Auto Approved." };
    case "to-negotiation":   return { title: "Sent to Negotiation",     body: "The request has been moved to the Negotiation phase." };
    case "confirm-payment":  return { title: "Payment Confirmed",       body: "Payment has been confirmed. The request is now in Payment Done status." };
    case "to-processing":    return { title: "Marked as Processing",    body: "The request is now in the Processing (T+1/T+2 settlement) phase." };
    case "to-settled":       return { title: "Marked as Settled",       body: "The sell request has been marked as Settled successfully." };
    default:                 return { title: "Done",                    body: "Action completed successfully." };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SellRequestsPage() {
  const location = useLocation();
  const pageRole: UserRole = location.pathname.startsWith("/admin")
    ? "ops"
    : location.pathname.startsWith("/ifa")
    ? "ifa"
    : "investor";

  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SellRequestStatus | "All">("All");
  const [negotiateRequest, setNegotiateRequest] = useState<SellRequest | null>(null);
  const [negotiateSuccess, setNegotiateSuccess] = useState<"counter" | "accept" | "reject" | null>(null);
  const [actionModal, setActionModal] = useState<{ request: SellRequest; type: SellActionType } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<SellActionType | null>(null);

  useEffect(() => {
    fetchSellRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "All") return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  return (
    <PortalLayout role={pageRole}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">
            {pageRole === "ops" ? "Sell Requests — Ops View" : "Sell Requests"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pageRole === "ops"
              ? "Manage all investor sell requests across the full lifecycle"
              : pageRole === "ifa"
              ? "Track and manage sell requests for your investors"
              : "Track and manage your sell orders through the complete lifecycle"}
          </p>
        </div>

        {/* Flow pipeline */}
        <div className="card-elevated p-4 space-y-4">
          <p className="text-sm font-semibold">Sell Request Lifecycle</p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Auto Approved Flow</p>
            <div className="flex flex-wrap items-center gap-1">
              {AUTO_APPROVED_FLOW.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${step.color}`}>{step.label}</span>
                  {i < AUTO_APPROVED_FLOW.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Negotiation Flow</p>
            <div className="flex flex-wrap items-center gap-1">
              {NEGOTIATION_FLOW.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${step.color}`}>{step.label}</span>
                  {i < NEGOTIATION_FLOW.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1 border-t border-border text-xs text-muted-foreground">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />
              Rejected / Terminated can occur at any active stage
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-1" />
              DIS (Delivery Instruction Slip) required after Seller Approved / Auto Approved
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeTab === tab
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading sell requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No sell requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Request ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Bond</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Order ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Units</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Yield</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Settlement Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => (
                    <tr key={req.requestId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{req.requestId}</td>
                      <td className="px-4 py-3">{req.bondName}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{req.orderId}</td>
                      <td className="px-4 py-3">{req.units}</td>
                      <td className="px-4 py-3">{req.yield}%</td>
                      <td className="px-4 py-3 whitespace-nowrap">{req.settlementDate}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(req.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                            {req.status}
                          </span>
                          {req.utr && (
                            <p className="text-xs text-muted-foreground mt-1">{req.utr}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusActions
                          status={req.status}
                          role={pageRole}
                          onNegotiate={() => setNegotiateRequest(req)}
                          onAction={(type) => setActionModal({ request: req, type })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Negotiate modal */}
      {negotiateRequest && (
        <NegotiateModal
          request={negotiateRequest}
          onClose={() => setNegotiateRequest(null)}
          onSuccess={(action) => {
            setNegotiateRequest(null);
            setNegotiateSuccess(action);
          }}
        />
      )}

      {negotiateSuccess && (
        <SuccessModal
          title={
            negotiateSuccess === "counter" ? "Counter Quote Submitted" :
            negotiateSuccess === "accept"  ? "Quote Accepted" :
                                             "Quote Rejected"
          }
          body={
            negotiateSuccess === "counter" ? "Your counter quote has been sent to the buyer. You'll be notified when they respond." :
            negotiateSuccess === "accept"  ? "You have successfully accepted the buyer's quote. The trade will proceed to settlement." :
                                             "The buyer's quote has been rejected. The negotiation is now closed."
          }
          onClose={() => setNegotiateSuccess(null)}
        />
      )}

      {/* Action modal */}
      {actionModal && (
        <SellActionModal
          request={actionModal.request}
          type={actionModal.type}
          onClose={() => setActionModal(null)}
          onSuccess={(t) => {
            setActionModal(null);
            setActionSuccess(t);
          }}
        />
      )}

      {actionSuccess && (
        <SuccessModal
          title={successCopy(actionSuccess).title}
          body={successCopy(actionSuccess).body}
          onClose={() => setActionSuccess(null)}
        />
      )}
    </PortalLayout>
  );
}
