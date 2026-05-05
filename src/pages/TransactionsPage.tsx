import { useEffect, useMemo, useState } from "react";
import { fetchTransactions } from "@/services/api";
import { DEMAT_ACCOUNTS } from "@/data/mockData";
import type { Transaction } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";

const dematMap = Object.fromEntries(DEMAT_ACCOUNTS.map((a) => [a.id, a]));

type FilterTab = "All" | "Buy" | "Sell";

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">All buy and sell transactions</p>
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
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["ID", "Type", "Bond", "ISIN", "Units", "Price", "Yield", "Date", "UTR", "Bank", "Demat Account", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((txn) => (
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
                      <td className="px-4 py-3 whitespace-nowrap">{txn.bondName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{txn.isin}</td>
                      <td className="px-4 py-3">{txn.units}</td>
                      <td className="px-4 py-3 whitespace-nowrap">₹{txn.price.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">{txn.yield != null ? `${txn.yield}%` : "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{txn.date}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{txn.utr ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{txn.bank ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {txn.dematAccountId && dematMap[txn.dematAccountId]
                          ? `${dematMap[txn.dematAccountId].dpName} · XXXX XXXX ${dematMap[txn.dematAccountId].accountNumber.slice(-4)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle(txn.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                          {txn.status}
                        </span>
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
