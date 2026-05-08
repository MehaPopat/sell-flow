import { useEffect, useState } from "react";
import { fetchSellQuotes } from "@/services/api";
import type { SellQuote, SellQuoteStatus } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";

type Tab = "All" | SellQuoteStatus;

const TABS: Tab[] = ["All", "Pending", "Approved", "Expired", "Cancelled"];

function statusStyle(status: SellQuoteStatus): string {
  switch (status) {
    case "Pending":   return "bg-blue-100 text-blue-700";
    case "Approved":  return "bg-green-100 text-green-700";
    case "Expired":   return "bg-orange-100 text-orange-700";
    case "Cancelled": return "bg-red-100 text-red-600";
  }
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default function SellQuotesPage() {
  const [quotes, setQuotes] = useState<SellQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSellQuotes()
      .then(setQuotes)
      .finally(() => setLoading(false));
  }, []);

  async function confirmCancel(quoteId: string) {
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 700));
    setQuotes((prev) =>
      prev.map((q) => q.quoteId === quoteId ? { ...q, status: "Cancelled" } : q)
    );
    setCancelling(false);
    setCancellingId(null);
  }

  function tabCount(tab: Tab): number {
    if (tab === "All") return quotes.length;
    return quotes.filter((q) => q.status === tab).length;
  }

  const visible = activeTab === "All" ? quotes : quotes.filter((q) => q.status === activeTab);

  return (
    <PortalLayout role="investor">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Sell Quotes</h1>
          <p className="text-sm text-muted-foreground">
            Quotes submitted for bonds purchased from external vendors
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCancellingId(null); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeTab === tab
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {!loading && (
                <span className={`ml-1.5 ${activeTab === tab ? "opacity-80" : "opacity-60"}`}>
                  ({tabCount(tab)})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading sell quotes...</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No {activeTab !== "All" ? activeTab.toLowerCase() : ""} sell quotes found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Quote ID", "ISIN Name", "ISIN", "Units", "Yield", "Purchase Date", "Purchase Amount", "Expired At", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((q) => (
                    <>
                      <tr
                        key={q.quoteId}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{q.quoteId}</td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="font-medium leading-snug">{q.isinName}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{q.isin}</td>
                        <td className="px-4 py-3">{q.units}</td>
                        <td className="px-4 py-3">{q.yield}%</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(q.purchaseDate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">₹{q.purchaseAmount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">{formatDateTime(q.expiredAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(q.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {q.status === "Pending" && (
                            <button
                              className="rounded-full px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-600 bg-transparent hover:bg-red-50 transition"
                              onClick={() => setCancellingId(q.quoteId)}
                            >
                              × Cancel
                            </button>
                          )}
                        </td>
                      </tr>

                      {cancellingId === q.quoteId && (
                        <tr key={`${q.quoteId}-confirm`} className="bg-red-50 border-b border-border">
                          <td colSpan={10} className="px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm text-red-700 font-medium">
                                Cancel quote <span className="font-bold">{q.quoteId}</span> for {q.isinName}? This cannot be undone.
                              </p>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  className="rounded-full px-3 py-1.5 text-xs font-semibold border border-input text-muted-foreground bg-white hover:text-foreground transition"
                                  onClick={() => setCancellingId(null)}
                                  disabled={cancelling}
                                >
                                  Keep Quote
                                </button>
                                <button
                                  className="rounded-full px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                                  onClick={() => confirmCancel(q.quoteId)}
                                  disabled={cancelling}
                                >
                                  {cancelling ? "Cancelling…" : "Confirm Cancel"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
