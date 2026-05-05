import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchDematAccounts, fetchInvestorsForIFA, fetchSellOrders } from "@/services/api";
import type { DematAccount, SellOrder, SellOrderStatus, UserRole } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/session";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const ORDER_STATUS_OPTIONS: SellOrderStatus[] = ["Executed", "Pending", "Cancelled"];

export default function SellOrdersPage() {
  const [accounts, setAccounts] = useState<DematAccount[]>([]);
  const [orders, setOrders] = useState<SellOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [accountFilter, setAccountFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const { role } = useParams<{ role?: string }>();
  const location = useLocation();

  const pageRole: UserRole = location.pathname.startsWith("/admin")
    ? "ops"
    : role === "ifa"
    ? "ifa"
    : "investor";

  useEffect(() => {
    setLoading(true);
    const session = getSession();

    if (pageRole === "ifa" && session?.userId) {
      fetchInvestorsForIFA(session.userId).then((investors) => {
        const ifaAccounts = investors.flatMap((inv) => inv.accounts);
        const ifaAccountIds = new Set(ifaAccounts.map((a) => a.id));
        fetchSellOrders().then((allOrders) => {
          setAccounts(ifaAccounts);
          setOrders(allOrders.filter((o) => ifaAccountIds.has(o.dematAccountId)));
          setLoading(false);
        });
      });
    } else {
      Promise.all([fetchDematAccounts(), fetchSellOrders()])
        .then(([fetchedAccounts, fetchedOrders]) => {
          setAccounts(fetchedAccounts);
          setOrders(fetchedOrders);
        })
        .finally(() => setLoading(false));
    }
  }, [pageRole]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (accountFilter && order.dematAccountId !== accountFilter) return false;
      if (statusFilter && order.status !== statusFilter) return false;
      const orderDate = new Date(order.orderDate);
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (orderDate < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }
      return true;
    });
  }, [orders, accountFilter, statusFilter, fromDate, toDate]);

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.accountType} Account` : accountId;
  };

  return (
    <PortalLayout role={pageRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Sell Orders</h1>
          <p className="text-sm text-muted-foreground">
            {pageRole === "ifa"
              ? "Sell orders for your investors"
              : pageRole === "ops"
              ? "All sell orders across investors"
              : "Manage your sell orders"}
          </p>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="filter-account" className="text-sm font-medium">Demat Account</label>
              <select
                id="filter-account"
                className="w-full rounded border border-input px-3 py-2 text-sm"
                value={accountFilter}
                onChange={(event) => setAccountFilter(event.target.value)}
              >
                <option value="">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountType} Account
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="filter-status" className="text-sm font-medium">Order Status</label>
              <select
                id="filter-status"
                className="w-full rounded border border-input px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All Statuses</option>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="filter-from" className="text-sm font-medium">From Date</label>
              <Input
                id="filter-from"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="filter-to" className="text-sm font-medium">To Date</label>
              <Input
                id="filter-to"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card-elevated">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order History</h2>
              {loading && <span className="text-xs bg-muted px-2 py-1 rounded">Loading orders...</span>}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading sell orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No sell orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Demat Account</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity Sold</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sell Price</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId} className="border-b border-border">
                      <td className="p-4 text-sm">{order.orderId}</td>
                      <td className="p-4 text-sm">{getAccountName(order.dematAccountId)}</td>
                      <td className="p-4 text-sm">{order.stockName}</td>
                      <td className="p-4 text-sm font-mono">{order.symbol}</td>
                      <td className="p-4 text-sm">{order.quantity}</td>
                      <td className="p-4 text-sm">{formatCurrency(order.sellPrice)}</td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Executed" ? "bg-success/10 text-success" :
                          order.status === "Pending" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{formatDateTime(order.orderDate)}</td>
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
