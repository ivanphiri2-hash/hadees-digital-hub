// UI-only preview auth for the admin shell. This is intentionally NOT a
// security boundary — it's a demo gate so the admin dashboard is shareable
// without exposing it to anonymous visitors. Real auth arrives when Lovable
// Cloud is enabled and this file is swapped for a Supabase session hook.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "hadees.admin.preview";
const DEMO_EMAIL = "admin@hadeestrading.co.za";
const DEMO_PASSWORD = "hadees-demo";

type AdminUser = { email: string; name: string; role: "owner" };

interface AdminAuthCtx {
  user: AdminUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

const Ctx = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return { ok: false as const, error: "Invalid demo credentials." };
    }
    const next: AdminUser = { email: DEMO_EMAIL, name: "Hadees Admin", role: "owner" };
    setUser(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
