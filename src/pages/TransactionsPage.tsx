import { useEffect, useMemo, useState } from "react";
import { fetchTransactions, fetchSellRequests } from "@/services/api";
import { DEMAT_ACCOUNTS } from "@/data/mockData";
import type { SellRequest, SellRequestStatus, Transaction } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";
import { NegotiateModal } from "@/components/NegotiateModal";
import { SellActionModal } from "@/components/SellActionModal";
import type { SellActionType } from "@/components/SellActionModal";
import { SuccessModal } from "@/components/SuccessModal";

const dematMap = Object.fromEntries(DEMAT_ACCOUNTS.map((a) => [a.id, a]));

type FilterTab = "All" | "Buy" | "Sell";

const btn = {
  primary: "rounded-full px-3 py-1.5 text-xs font-semibold bg-accent text-white border border-transparent transition hover:-translate-y-px whitespace-nowrap",
  success: "rounded-full px-3 py-1.5 text-xs font-semibold bg-green-600 text-white border border-transparent transition hover:-translate-y-px whitespace-nowrap",
  danger:  "rounded-full px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-600 bg-transparent hover:bg-red-50 transition whitespace-nowrap",
  ghost:   "rounded-full px-3 py-1.5 text-xs font-semibold border border-input text-muted-foreground bg-transparent hover:text-foreground hover:border-foreground/30 transition whitespace-nowrap",
  muted:   "rounded-full px-3 py-1.5 text-xs font-semibold bg-muted text-muted-foreground cursor-default select-none whitespace-nowrap",
};

function SellActions({
  status,
  onNegotiate,
  onAction,
}: {
  status: SellRequestStatus;
  onNegotiate: () => void;
  onAction: (type: SellActionType) => void;
}) {
  switch (status) {
    case "Sell Initiated":
      return <button className={btn.danger} onClick={() => onAction("cancel")}>× Cancel</button>;
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
      return <button className={btn.ghost} onClick={() => onAction("view")}>View</button>;
    default:
      return null;
  }
}

function successCopy(type: SellActionType): { title: string; body: string } {
  switch (type) {
    case "reject":          return { title: "Proposal Rejected",   body: "The proposal has been rejected successfully." };
    case "cancel":          return { title: "Request Cancelled",   body: "Your sell request has been cancelled." };
    case "approve":         return { title: "Proposal Approved",   body: "The proposal has been approved. Moving to Seller Approved." };
    case "dis":             return { title: "DIS Uploaded",        body: "Your DIS copy has been uploaded successfully." };
    case "terminate":       return { title: "Request Terminated",  body: "The sell request has been terminated." };
    default:                return { title: "Done",                body: "Action completed successfully." };
  }
}

function statusStyle(status: string): string {
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
    default:                return "bg-muted text-muted-foreground";
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const [negotiateRequest, setNegotiateRequest] = useState<SellRequest | null>(null);
  const [negotiateSuccess, setNegotiateSuccess] = useState<"counter" | "accept" | "reject" | null>(null);
  const [actionModal, setActionModal] = useState<{
    request: SellRequest;
    type: SellActionType;
    dematDisplay?: { name: string; account: string };
    bankDisplay?: { name: string; account: string };
    purchasePrice?: number;
  } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<SellActionType | null>(null);

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSellRequests()])
      .then(([txns, reqs]) => { setTransactions(txns); setSellRequests(reqs); })
      .finally(() => setLoading(false));
  }, []);

  const sellRequestMap = useMemo(
    () => Object.fromEntries(sellRequests.map((r) => [r.requestId, r])),
    [sellRequests]
  );

  const filtered = useMemo(() => {
    if (activeTab === "All") return transactions;
    return transactions.filter((t) => t.type === activeTab);
  }, [transactions, activeTab]);

  const buyCount  = useMemo(() => transactions.filter((t) => t.type === "Buy").length,  [transactions]);
  const sellCount = useMemo(() => transactions.filter((t) => t.type === "Sell").length, [transactions]);

  return (
    <PortalLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">All buy and sell orders</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-elevated p-4">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-xs text-muted-foreground mb-1">Buy Orders</p>
            <p className="text-2xl font-bold text-accent">{buyCount}</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-xs text-muted-foreground mb-1">Sell Requests</p>
            <p className="text-2xl font-bold text-accent">{sellCount}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["All", "Buy", "Sell"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors ${
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
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["ID", "Type", "Bond", "Units", "Price", "Yield", "Date", "UTR", "Bank", "Demat Account", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((txn) => {
                    const sellReq = txn.type === "Sell" ? sellRequestMap[txn.id] : undefined;
                    return (
                      <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{txn.id}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            txn.type === "Sell"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="font-medium leading-snug whitespace-nowrap">{txn.bondName}</p>
                          <p className="font-mono text-xs text-muted-foreground mt-0.5">{txn.isin}</p>
                        </td>
                        <td className="px-4 py-3">{txn.units}</td>
                        <td className="px-4 py-3 whitespace-nowrap">₹{txn.price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">{txn.yield != null ? `${txn.yield}%` : "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{txn.date}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{txn.utr ?? "—"}</td>
                        <td className="px-4 py-3">
                          {txn.bank ? (() => {
                            const idx = txn.bank.indexOf("XXXX");
                            const name = idx > 0 ? txn.bank.slice(0, idx).trim() : txn.bank;
                            const num  = idx > 0 ? txn.bank.slice(idx).trim() : null;
                            return (
                              <>
                                <p className="text-xs font-medium whitespace-nowrap">{name}</p>
                                {num && <p className="text-xs text-muted-foreground whitespace-nowrap">{num}</p>}
                              </>
                            );
                          })() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {txn.dematAccountId && dematMap[txn.dematAccountId] ? (
                            <>
                              <p className="text-xs font-medium whitespace-nowrap">{dematMap[txn.dematAccountId].dpName}</p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">XXXX XXXX {dematMap[txn.dematAccountId].accountNumber.slice(-4)}</p>
                            </>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle(txn.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sellReq ? (
                            <SellActions
                              status={sellReq.status}
                              onNegotiate={() => setNegotiateRequest(sellReq)}
                              onAction={(type) => {
                                const demat = txn.dematAccountId ? dematMap[txn.dematAccountId] : undefined;
                                const bankIdx = txn.bank?.indexOf("XXXX") ?? -1;
                                setActionModal({
                                  request: sellReq,
                                  type,
                                  dematDisplay: demat
                                    ? { name: demat.dpName, account: `XXXX XXXX ${demat.accountNumber.slice(-4)}` }
                                    : undefined,
                                  bankDisplay: txn.bank
                                    ? { name: bankIdx > 0 ? txn.bank.slice(0, bankIdx).trim() : txn.bank, account: bankIdx > 0 ? txn.bank.slice(bankIdx).trim() : "" }
                                    : undefined,
                                  purchasePrice: txn.price,
                                });
                              }}
                            />
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
            negotiateSuccess === "counter" ? "Your counter quote has been sent to the buyer." :
            negotiateSuccess === "accept"  ? "You have accepted the buyer's quote. The trade will proceed to settlement." :
                                             "The buyer's quote has been rejected."
          }
          onClose={() => setNegotiateSuccess(null)}
        />
      )}

      {actionModal && (
        <SellActionModal
          request={actionModal.request}
          type={actionModal.type}
          dematDisplay={actionModal.dematDisplay}
          bankDisplay={actionModal.bankDisplay}
          purchasePrice={actionModal.purchasePrice}
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
