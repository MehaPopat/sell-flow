import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { clearSession } from "@/lib/session";

interface NavItem {
  label: string;
  path: string;
  icon?: ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  investor: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Sell Requests", path: "/sell-requests" },
    { label: "Transactions", path: "/transactions" },
  ],
  ifa: [
    { label: "Dashboard", path: "/ifa/investors" },
    { label: "Sell Orders", path: "/sell-orders/ifa" },
  ],
  ops: [
    { label: "Dashboard", path: "/admin/ifas" },
    { label: "Investors", path: "/admin/investors" },
    { label: "Sell Orders", path: "/admin/sell-orders" },
  ],
};

const profilePath: Partial<Record<UserRole, string>> = {
  investor: "/investor/profile",
  ifa: "/ifa/profile",
};

interface TopNavProps {
  role: UserRole;
}

export function TopNav({ role }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItems[role];
  const roleLabel = role === "investor" ? "Investor" : role === "ifa" ? "IFA" : "Ops Admin";
  const roleBadgePath = profilePath[role];

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link
            to={
              role === "ops"
                ? "/admin/ifas"
                : role === "ifa"
                ? "/ifa/investors"
                : "/dashboard"
            }
            className="flex items-center gap-2"
          >
            <span className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-500" />
            <span className="text-lg font-semibold tracking-tight">Sell Flow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium rounded-full px-4 py-2 transition",
                  location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {roleBadgePath ? (
            <Link
              to={roleBadgePath}
              className="hidden sm:inline text-xs font-semibold bg-accent/10 text-accent border border-accent/20 rounded-full px-3 py-1 transition hover:bg-accent/20"
            >
              {roleLabel}
            </Link>
          ) : (
            <span className="hidden sm:inline text-xs font-semibold bg-accent/10 text-accent border border-accent/20 rounded-full px-3 py-1">
              {roleLabel}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ role }: TopNavProps) {
  const location = useLocation();
  const items = navItems[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs text-muted-foreground py-1 px-2 min-w-[60px]",
              (location.pathname === item.path || location.pathname.startsWith(item.path + "/")) && "text-accent font-medium"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
