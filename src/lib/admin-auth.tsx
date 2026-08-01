// Supabase-backed session + role context for the admin control centre.
// Roles live in public.user_roles and are enforced by RLS on the server —
// this hook only drives what the UI shows.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/platform.functions";

export type AppRole =
  | "super_admin" | "administrator" | "sales" | "project_manager"
  | "finance" | "support" | "client";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
}

interface AdminAuthCtx {
  user: AdminUser | null;
  ready: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const fetchAccess = useServerFn(getMyAccess);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { setUser(null); setReady(true); return; }
    try {
      const access = await fetchAccess({});
      setUser({
        id: access.userId,
        email: data.session.user.email ?? "",
        name: access.profile?.full_name ?? data.session.user.email ?? "Team member",
        roles: access.roles as AppRole[],
        isStaff: access.isStaff,
        isAdmin: access.isAdmin,
      });
    } catch {
      setUser(null);
    }
    setReady(true);
  }, [fetchAccess]);

  useEffect(() => {
    void refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, refresh, signOut }), [user, ready, refresh, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
