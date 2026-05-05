import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchIFAs } from "@/services/api";
import { PortalLayout } from "@/components/PortalLayout";
import type { IFA } from "@/types";

export default function AdminIFAListPage() {
  const [ifas, setIfas] = useState<IFA[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIFAs().then((data) => {
      setIfas(data);
      setLoading(false);
    });
  }, []);

  const filtered = ifas.filter((ifa) => {
    const q = search.toLowerCase();
    return (
      ifa.name.toLowerCase().includes(q) ||
      ifa.email.toLowerCase().includes(q) ||
      ifa.phone.includes(q)
    );
  });

  return (
    <PortalLayout role="ops">
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-xl font-semibold">IFA List</h1>
          <p className="text-sm text-muted-foreground">Manage and view IFA profiles and their investors</p>
        </div>

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
                    <td colSpan={4} className="investor-empty">Loading IFAs...</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="investor-empty">No IFAs found</td>
                  </tr>
                )}
                {filtered.map((ifa) => (
                  <tr key={ifa.id} className="investor-row">
                    <td className="investor-td">
                      <div className="investor-name-cell">
                        <span className="investor-avatar">{ifa.name.charAt(0).toUpperCase()}</span>
                        <span className="investor-name">{ifa.name}</span>
                      </div>
                    </td>
                    <td className="investor-td investor-email">{ifa.email}</td>
                    <td className="investor-td investor-phone">+91 {ifa.phone}</td>
                    <td className="investor-td investor-td-action">
                      <div className="investor-actions">
                        {ifa.investorIds.length > 0 && (
                          <button
                            className="action-btn action-btn-primary"
                            onClick={() => navigate(`/admin/ifas/${ifa.id}/investors`)}
                          >
                            Investors
                          </button>
                        )}
                        <button
                          className="action-btn action-btn-secondary"
                          onClick={() => navigate(`/admin/ifas/${ifa.id}/profile`)}
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
