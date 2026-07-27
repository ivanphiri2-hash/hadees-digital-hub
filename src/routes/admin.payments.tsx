import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Lock, Search } from "lucide-react";

import { adminListOrders, adminVerifyToken } from "@/lib/orders.functions";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Hadees Trading Admin" },
      { name: "description", content: "PayFast payments dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentsAdmin,
});

const STORAGE_KEY = "hadees.admin.token";

function formatZar(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  cancelled: "bg-slate-500/20 text-slate-300",
  refunded: "bg-indigo-500/15 text-indigo-300",
};

function PaymentsAdmin() {
  const [token, setToken] = useState<string>("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) { setToken(saved); setAuthed(true); }
  }, []);

  const verify = useMutation({
    mutationFn: (t: string) => adminVerifyToken({ data: { token: t } }),
    onSuccess: () => {
      window.sessionStorage.setItem(STORAGE_KEY, token);
      setAuthed(true); setError(null);
    },
    onError: (e: Error) => { setError(e.message); setAuthed(false); },
  });

  const query = useQuery({
    queryKey: ["admin-orders", token],
    queryFn: () => adminListOrders({ data: { token } }),
    enabled: authed && !!token,
    refetchInterval: 30000,
  });

  const stats = useMemo(() => {
    const rows = query.data ?? [];
    const paid = rows.filter((r) => r.status === "paid");
    const pending = rows.filter((r) => r.status === "pending");
    const failed = rows.filter((r) => r.status === "failed");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const paidToday = paid.filter((r) => r.paid_at && new Date(r.paid_at) >= today);
    const paidMonth = paid.filter((r) => r.paid_at && new Date(r.paid_at) >= monthStart);
    const total = paid.reduce((sum, r) => sum + r.amount_cents, 0);
    const monthTotal = paidMonth.reduce((sum, r) => sum + r.amount_cents, 0);
    return {
      totalRevenue: total,
      today: paidToday.length,
      todayRevenue: paidToday.reduce((s, r) => s + r.amount_cents, 0),
      monthRevenue: monthTotal,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
    };
  }, [query.data]);

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        r.reference.toLowerCase().includes(needle) ||
        r.customer_email.toLowerCase().includes(needle) ||
        r.customer_name.toLowerCase().includes(needle) ||
        r.service_name.toLowerCase().includes(needle) ||
        (r.pf_payment_id ?? "").toLowerCase().includes(needle)
      );
    });
  }, [query.data, q, status]);

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <div className="glass rounded-2xl p-7">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[var(--color-gold)]" />
            <h1 className="font-display text-xl font-bold">Admin Payments</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste your ADMIN_TOKEN (stored in your Cloud secrets) to view the payments dashboard.
          </p>
          <form
            onSubmit={(e: FormEvent) => { e.preventDefault(); verify.mutate(token); }}
            className="mt-5 grid gap-3"
          >
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ADMIN_TOKEN"
              className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-[var(--color-royal)]"
            />
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}
            <button className="rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white" type="submit" disabled={verify.isPending}>
              {verify.isPending ? "Verifying…" : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin · PayFast</div>
          <h1 className="mt-1 font-display text-3xl font-black">Payments</h1>
        </div>
        <button
          onClick={() => { window.sessionStorage.removeItem(STORAGE_KEY); setAuthed(false); setToken(""); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >Sign out</button>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total revenue" value={formatZar(stats.totalRevenue)} tone="gold" />
        <Kpi label="Today" value={`${stats.today} · ${formatZar(stats.todayRevenue)}`} />
        <Kpi label="This month" value={formatZar(stats.monthRevenue)} />
        <Kpi label="Pending / Failed" value={`${stats.pending} / ${stats.failed}`} tone="warn" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search reference, customer, service…"
            className="w-full rounded-full border border-border/70 bg-card/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-royal)]"
          />
        </div>
        <select
          value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-border/70 bg-card/40 px-3 py-2 text-sm outline-none"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-card/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">PayFast ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {query.isLoading && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…</td></tr>
            )}
            {!query.isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-card/40">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("en-ZA")}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{r.reference}</td>
                <td className="px-4 py-3">{r.service_name}</td>
                <td className="px-4 py-3">
                  <div>{r.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{r.customer_email}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatZar(r.amount_cents)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${STATUS_STYLES[r.status] ?? "bg-slate-500/20"}`}>{r.status}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{r.pf_payment_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "gold" | "warn" }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-black ${tone === "gold" ? "text-[var(--color-gold)]" : tone === "warn" ? "text-amber-400" : ""}`}>{value}</div>
    </div>
  );
}
