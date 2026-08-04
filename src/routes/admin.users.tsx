import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsers, setUserRole, ROLE_OPTIONS } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, shortDate } from "@/components/admin/shell";
import { Toolbar, inputCls } from "@/components/admin/table";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — Hadees Trading Control Centre" },
      { name: "description", content: "Manage staff accounts and role-based permissions across the Hadees Trading platform." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UsersPage,
});

const ROLE_HELP: Record<string, string> = {
  super_admin: "Full control, including roles and settings",
  administrator: "Full operational control",
  sales: "Leads, clients and quotations",
  project_manager: "Projects, tasks and delivery",
  finance: "Invoices, payments and receipts",
  support: "Support tickets and client comms",
  client: "Client portal access only",
};

function UsersPage() {
  const { user } = useAdminAuth();
  const fetchUsers = useServerFn(listUsers);
  const patchRole = useServerFn(setUserRole);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "users"], queryFn: () => fetchUsers({}) });
  const [term, setTerm] = useState("");

  const m = useMutation({
    mutationFn: (v: { user_id: string; role: (typeof ROLE_OPTIONS)[number]; grant: boolean }) => patchRole({ data: v }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const users = q.data ?? [];
  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return users.filter((u) => !t || [u.full_name, u.email].some((v) => (v ?? "").toLowerCase().includes(t)));
  }, [users, term]);

  const canManage = !!user?.isAdmin;

  return (
    <AdminShell title="Users & Roles" subtitle="Role-based access control for every staff member and client account.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Accounts" value={String(users.length)} />
        <KpiCard label="Staff" value={String(users.filter((u) => u.roles.some((r) => r !== "client")).length)} tone="green" />
        <KpiCard label="Clients" value={String(users.filter((u) => u.roles.includes("client")).length)} tone="gold" />
        <KpiCard label="Administrators" value={String(users.filter((u) => u.roles.some((r) => r === "super_admin" || r === "administrator")).length)} />
      </div>

      <AdminPanel title="Accounts">
        <Toolbar>
          <input className={inputCls} placeholder="Search name or email…" value={term} onChange={(e) => setTerm(e.target.value)} />
        </Toolbar>

        {q.isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
        {!canManage && <p className="mb-3 text-xs text-amber-300">Only administrators can change role assignments.</p>}
        {m.error && <p className="mb-3 text-xs text-red-400">{(m.error as Error).message}</p>}

        <div className="grid gap-3">
          {rows.map((u) => (
            <div key={u.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{u.full_name ?? "Unnamed user"}</div>
                  <div className="text-[11px] text-muted-foreground">{u.email} · joined {shortDate(u.created_at)}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ROLE_OPTIONS.map((role) => {
                  const on = u.roles.includes(role);
                  return (
                    <button
                      key={role}
                      title={ROLE_HELP[role]}
                      disabled={!canManage || m.isPending}
                      onClick={() => m.mutate({ user_id: u.id, role, grant: !on })}
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-40 ${
                        on
                          ? "bg-[color-mix(in_oklab,var(--color-royal)_30%,transparent)] text-foreground"
                          : "border border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {role.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!q.isLoading && rows.length === 0 && <p className="text-xs text-muted-foreground">No accounts match that search.</p>}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
