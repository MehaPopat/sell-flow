import type { UserRole } from "@/types";

export interface Session {
  role: UserRole;
  userId?: string;
}

export function getSession(): Session | null {
  try {
    const s = localStorage.getItem("sell-flow-session");
    return s ? (JSON.parse(s) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem("sell-flow-session", JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem("sell-flow-session");
}
