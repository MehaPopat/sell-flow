import { useEffect, useMemo, useState } from "react";
import { fetchSellRequests } from "@/services/api";
import type { SellRequest, SellRequestStatus } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";

const FLOW_STEPS: { label: string; color: string }[] = [
  { label: "1. Sell Initiated",  color: "bg-blue-100 text-blue-700" },
  { label: "2. Negotiation",     color: "bg-amber-100 text-amber-700" },
  { label: "3. Buyer Approved",  color: "bg-green-100 text-green-700" },
  { label: "4. Seller Approved", color: "bg-teal-100 text-teal-700" },
  { label: "5. Payment Done",    color: "bg-cyan-100 text-cyan-700" },
  { label: "6. Processing",      color: "bg-orange-100 text-orange-700" },
  { label: "7. Settled",         color: "bg-emerald-100 text-emerald-700" },
];

const FILTER_TABS: Array<SellRequestStatus | "All"> = [
  "All", "Sell Initiated", "Negotiation", "Buyer Approved", "Seller Approved",
  "Rejected", "Payment Done", "Processing", "Settled", "Terminated",
];

function statusStyle(status: SellRequestStatus): string {
  switch (status) {
    case "Sell Initiated":  return "bg-blue-100 text-blue-700";
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

const btn = {
  primary:  "rounded-full px-3 py-1.5 text-xs font-semibold bg-accent text-white border border-transparent transition hover:-translate-y-px",
  success:  "rounded-full px-3 py-1.5 text-xs font-semibold bg-green-600 text-white border border-transparent transition hover:-translate-y-px",
  danger:   "rounded-full px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-600 bg-transparent hover:bg-red-50 transition",
  ghost:    "rounded-full px-3 py-1.5 text-xs font-semibold border border-input text-muted-foreground bg-transparent hover:text-foreground hover:border-foreground/30 transition",
  muted:    "rounded-full px-3 py-1.5 text-xs font-semibold bg-muted text-muted-foreground cursor-default select-none",
};

function StatusActions({ status }: { status: SellRequestStatus }) {
  switch (status) {
    case "Sell Initiated":
      return (
        <div className="flex items-center gap-2">
          <button className={btn.danger}>× Cancel</button>
        </div>
      );
    case "Negotiation":
      return (
        <div className="flex items-center gap-2">
          <button className={btn.primary}>Negotiate</button>
          <button className={btn.danger}>× Reject</button>
        </div>
      );
    case "Buyer Approved":
      return (
        <div className="flex items-center gap-2">
          <button className={btn.success}>✓ Approve</button>
          <button className={btn.danger}>× Reject</button>
        </div>
      );
    case "Settled":
      return (
        <div className="flex items-center gap-2">
          <button className={btn.ghost}>View</button>
          <button className={btn.ghost}>📎 DIS</button>
        </div>
      );
    case "InProgress":
      return (
        <div className="flex items-center gap-2">
          <span className={btn.muted}>⏱ In Progress</span>
          <button className={btn.ghost}>📎 DIS</button>
        </div>
      );
    default:
      return null;
  }
}

export default function SellRequestsPage() {
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SellRequestStatus | "All">("All");

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
    <PortalLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Sell Requests</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your sell orders through the complete lifecycle
          </p>
        </div>

        {/* Flow pipeline */}
        <div className="card-elevated p-4 space-y-3">
          <p className="text-sm font-semibold">Sell Request Flow</p>
          <div className="flex flex-wrap items-center gap-1">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-1">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${step.color}`}>
                  {step.label}
                </span>
                {i < FLOW_STEPS.length - 1 && (
                  <span className="text-muted-foreground text-xs">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Rejected or Terminated requests can be retried from any stage.
          </p>
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">DIS</th>
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
                      <td className="px-4 py-3 text-muted-foreground">—</td>
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
                        <StatusActions status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
