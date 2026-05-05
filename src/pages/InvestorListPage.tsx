import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInvestorsForIFA } from "@/services/api";
import { PortalLayout } from "@/components/PortalLayout";
import { getSession } from "@/lib/session";
import type { Investor } from "@/types";

export default function InvestorListPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    const ifaId = session?.userId ?? "";
    fetchInvestorsForIFA(ifaId).then((data) => {
      setInvestors(data);
      setLoading(false);
    });
  }, []);

  const filtered = investors.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.name.toLowerCase().includes(q) ||
      inv.email.toLowerCase().includes(q) ||
      inv.phone.includes(q)
    );
  });

  return (
    <PortalLayout role="ifa">
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-xl font-semibold">Investors</h1>
          <p className="text-sm text-muted-foreground">Manage and view your investor profiles</p>
        </div>

        {/* Search */}
        <div className="search-bar">
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <div className="investor-table-wrap">
            <table className="investor-table">
              <thead>
                <tr className="investor-thead-row">
                  <th className="investor-th">Name</th>
                  <th className="investor-th">Email</th>
                  <th className="investor-th">Phone</th>
                  <th className="investor-th investor-th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="investor-empty">
                      Loading investors...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="investor-empty">
                      No investors found
                    </td>
                  </tr>
                )}
                {filtered.map((inv) => (
                  <tr key={inv.id} className="investor-row">
                    <td className="investor-td">
                      <div className="investor-name-cell">
                        <span className="investor-avatar">
                          {inv.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="investor-name">{inv.name}</span>
                      </div>
                    </td>
                    <td className="investor-td investor-email">{inv.email}</td>
                    <td className="investor-td investor-phone">+91 {inv.phone}</td>
                    <td className="investor-td investor-td-action">
                      <div className="investor-actions">
                        {inv.accounts.length > 0 && (
                          <button
                            className="action-btn action-btn-primary"
                            onClick={() => navigate(`/ifa/investors/${inv.id}/holdings`)}
                          >
                            View Holdings
                          </button>
                        )}
                        <button
                          className="action-btn action-btn-secondary"
                          onClick={() => navigate(`/ifa/investors/${inv.id}/profile`)}
                        >
                          Profile View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
