import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchBondOrders,
  fetchDematAccounts,
  fetchDematAccountsForInvestor,
  fetchHoldingsForAccount,
  fetchInvestorById,
} from "@/services/api";
import type { BondOrder, DematAccount, Holding, UserRole } from "@/types";
import { PortalLayout } from "@/components/PortalLayout";
import { SellModal } from "@/components/SellModal";
import { ExternalSellModal } from "@/components/ExternalSellModal";
import { getSession } from "@/lib/session";

export default function DashboardPage() {
  const { id: investorId } = useParams<{ id?: string }>();
  const isIFAView = Boolean(investorId);
  const navigate = useNavigate();
  const session = getSession();
  const sessionRole = session?.role ?? "investor";
  const sessionUserId = session?.userId;
  const layoutRole: UserRole = isIFAView ? (sessionRole === "ops" ? "ops" : "ifa") : "investor";

  const [investorName, setInvestorName] = useState("");
  const [investorPhone, setInvestorPhone] = useState("");
  const [externalSellOpen, setExternalSellOpen] = useState(false);
  const [accounts, setAccounts] = useState<DematAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [search, setSearch] = useState("");

  // Panel state
  const [panelHolding, setPanelHolding] = useState<Holding | null>(null);
  const [panelAccountId, setPanelAccountId] = useState("");
  const [bondOrders, setBondOrders] = useState<BondOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sell modal state
  const [sellModalOrder, setSellModalOrder] = useState<BondOrder | null>(null);

  useEffect(() => {
    setLoadingAccounts(true);
    const targetId = investorId ?? (sessionRole === "investor" ? sessionUserId : undefined);
    const fetchAccounts = targetId ? fetchDematAccountsForInvestor(targetId) : fetchDematAccounts();

    fetchAccounts.then((data) => {
      // One primary, up to two secondary accounts per investor
      let primaryCount = 0;
      let secondaryCount = 0;
      const filtered = data.filter((a) => {
        if (a.accountType === "Primary" && primaryCount < 1) { primaryCount++; return true; }
        if (a.accountType === "Secondary" && secondaryCount < 2) { secondaryCount++; return true; }
        return false;
      });
      setAccounts(filtered);
      setSelectedAccountId("");
      setLoadingAccounts(false);
    });

    if (investorId) {
      fetchInvestorById(investorId).then((inv) => {
        if (inv) {
          setInvestorName(inv.name);
          setInvestorPhone(inv.phone);
        }
      });
    }
  }, [investorId, sessionRole, sessionUserId]);

  useEffect(() => {
    if (!selectedAccountId) { setHoldings([]); return; }
    setLoadingHoldings(true);
    fetchHoldingsForAccount(selectedAccountId)
      .then((data) => setHoldings(data))
      .finally(() => setLoadingHoldings(false));
  }, [selectedAccountId]);

  type DisplayHolding = { holding: Holding; accountId: string; accountLabel: string };

  const displayHoldings: DisplayHolding[] = useMemo(() => {
    if (selectedAccountId) {
      return holdings.map((h) => ({ holding: h, accountId: selectedAccountId, accountLabel: "" }));
    }
    return accounts.flatMap((a) =>
      a.holdings.map((h) => ({
        holding: h,
        accountId: a.id,
        accountLabel: `${a.dpName} ****${a.accountNumber.slice(-4)} (${a.accountType})`,
      }))
    );
  }, [selectedAccountId, holdings, accounts]);

  const filteredHoldings = useMemo(() => {
    if (!search) return displayHoldings;
    const q = search.toLowerCase();
    return displayHoldings.filter(
      ({ holding: h }) => h.bondName.toLowerCase().includes(q) || h.isin.toLowerCase().includes(q)
    );
  }, [search, displayHoldings]);

  function handleViewOrders(holding: Holding, accountId: string) {
    setPanelHolding(holding);
    setPanelAccountId(accountId);
    setLoadingOrders(true);
    fetchBondOrders(holding.isin, accountId)
      .then(setBondOrders)
      .finally(() => setLoadingOrders(false));
  }

  function closePanel() {
    setPanelHolding(null);
    setBondOrders([]);
  }

  return (
    <PortalLayout role={layoutRole}>
      <div className="space-y-6">
        {isIFAView && (
          <div className="back-btn-wrap">
            <button onClick={() => navigate(-1)} className="back-btn">
              ← Back to Investors
            </button>
          </div>
        )}
        <div className="text-left">
          <h1 className="text-xl font-semibold">
            {isIFAView ? `${investorName}'s Holdings` : "My Holdings"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isIFAView ? `Viewing portfolio on behalf of ${investorName}` : "View and manage your bond holdings by bond"}
          </p>
        </div>

        {/* Account Selector */}
        <div className="card-elevated p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

            {/* LEFT : Dropdown */}
            <div>
              <label
                htmlFor="demat-account-select"
                className="text-sm font-medium text-muted-foreground"
              >
                Select Demat Account
              </label>

              <select
                id="demat-account-select"
                className="w-full mt-1 rounded border border-input px-3 py-2 text-sm"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                disabled={loadingAccounts}
              >
                <option value="">All Demat Accounts</option>
                {accounts.map((a) => {
                  const masked = a.accountNumber.slice(-4);
                  const label = a.accountType?.toLowerCase() === "primary"
                    ? "Primary account"
                    : "Secondary account";
                  return (
                    <option key={a.id} value={a.id}>
                      {`${a.dpName} - ****${masked} (${label})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* RIGHT : Create Extra ISIN Sell */}
            <div className="flex justify-start md:justify-end">
              <button
                type="button"
                className="action-btn action-btn-primary"
                onClick={() => setExternalSellOpen(true)}
              >
                External sell order
              </button>
            </div>

          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            placeholder="Search by Bond name or ISIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Bond Holdings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHoldings.map(({ holding, accountId, accountLabel }) => (
            <div key={`${holding.isin}-${accountId}`} className="card-elevated p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{holding.bondName}</p>
                {accountLabel && (
                  <p className="text-xs font-semibold text-muted-foreground">{accountLabel}</p>
                )}
                <p className="text-xs text-muted-foreground font-mono">{holding.isin}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Holding</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold">{holding.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className={`font-bold ${holding.available > 0 ? "text-success" : ""}`}>
                      {holding.available}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blocked</p>
                    <p className={`font-bold ${holding.blocked > 0 ? "text-warning" : ""}`}>
                      {holding.blocked}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sold</p>
                    <p className="font-bold">{holding.sold}</p>
                  </div>
                </div>
              </div>

              <button
                className="w-full action-btn action-btn-primary"
                onClick={() => handleViewOrders(holding, accountId)}
              >
                View Orders
              </button>
            </div>
          ))}
        </div>

        {filteredHoldings.length === 0 && !loadingHoldings && (
          <div className="card-elevated p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? "No bonds match your search" : "No holdings available"}
            </p>
          </div>
        )}
        {loadingHoldings && selectedAccountId && (
          <div className="card-elevated p-8 text-center">
            <p className="text-sm text-muted-foreground">Loading holdings...</p>
          </div>
        )}
      </div>

      {/* View Orders modal — hidden while Sell modal is open */}
      {panelHolding && !sellModalOrder && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={closePanel} />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto">

              {/* Modal header */}
              <div className="px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base leading-snug">{panelHolding.bondName}</h2>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{panelHolding.isin}</p>
                  </div>
                  <button
                    onClick={closePanel}
                    className="text-muted-foreground hover:text-foreground text-2xl leading-none shrink-0"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-sm mt-0.5">{panelHolding.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className={`font-bold text-sm mt-0.5 ${panelHolding.available > 0 ? "text-success" : ""}`}>
                      {panelHolding.available}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blocked</p>
                    <p className={`font-bold text-sm mt-0.5 ${panelHolding.blocked > 0 ? "text-warning" : ""}`}>
                      {panelHolding.blocked}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sold</p>
                    <p className="font-bold text-sm mt-0.5">{panelHolding.sold}</p>
                  </div>
                </div>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <h3 className="font-semibold text-sm">Order Items</h3>

              {loadingOrders && (
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              )}

              {!loadingOrders && bondOrders.length === 0 && (
                <p className="text-sm text-muted-foreground">No orders found for this bond.</p>
              )}

              {!loadingOrders && bondOrders.map((order, idx) => (
                <div key={order.orderId} className="card-elevated p-4">

                  {/* Order ID + Purchased date */}
                  <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                    <span>Order ID</span>
                    <span>Purchased</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium">{order.orderId}</span>
                    <span className="text-muted-foreground">{order.purchasedDate}</span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">{order.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className={`font-semibold ${order.available > 0 ? "text-success" : ""}`}>
                        {order.available}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Blocked</p>
                      <p className={`font-semibold ${order.blocked > 0 ? "text-warning" : ""}`}>
                        {order.blocked}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sold</p>
                      <p className={`font-semibold ${order.sold > 0 ? "text-destructive" : ""}`}>
                        {order.sold}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border mb-4" />
                  {/* Price + action */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Price: ₹{order.price.toLocaleString("en-IN")}
                    </span>
                    {order.available > 0 ? (
                      <button
                        className="action-btn action-btn-primary text-sm"
                        onClick={() => setSellModalOrder(order)}
                      >
                        Sell
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Fully Sold</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      {sellModalOrder && panelHolding && (
        <SellModal
          order={sellModalOrder}
          holding={panelHolding}
          role={layoutRole}
          investorName={investorName || undefined}
          investorPhone={investorPhone || undefined}
          onBack={() => setSellModalOrder(null)}
          onClose={() => { setSellModalOrder(null); closePanel(); }}
          onSuccess={() => { setSellModalOrder(null); closePanel(); }}
        />
      )}

      {externalSellOpen && (
        <ExternalSellModal
          role={layoutRole}
          investorName={investorName || undefined}
          investorPhone={investorPhone || undefined}
          onClose={() => setExternalSellOpen(false)}
          onSuccess={() => setExternalSellOpen(false)}
        />
      )}
    </PortalLayout>
  );
}
