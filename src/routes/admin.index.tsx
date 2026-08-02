import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, StatusPill, money, shortDate } from "@/components/admin/shell";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Hadees Trading Control Centre" },
      { name: "description", content: "Revenue, leads, projects, invoices and support performance for Hadees Trading." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminHome,
});

function Bars({ data, format }: { data: { label: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="grid gap-2">
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-xs">
          <span className="truncate text-muted-foreground">{d.label}</span>
          <span className="h-2 rounded-full bg-white/5">
            <span className="block h-2 rounded-full bg-[var(--color-royal)]" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="tabular-nums text-muted-foreground">{format(d.value)}</span>
        </div>
      ))}
      {data.length === 0 && <p className="text-xs text-muted-foreground">No data yet.</p>}
    </div>
  );
}

function AdminHome() {
  const fetchOverview = useServerFn(getAdminOverview);
  const q = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fetchOverview({}) });
  const d = q.data;

  return (
    <AdminShell title="Dashboard" subtitle="Live operational view of revenue, pipeline, delivery and support.">
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading metrics…</p>}
      {q.error && <p className="text-sm text-red-400">{(q.error as Error).message}</p>}

      {d && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total revenue" value={money(d.kpi.revenueCents)} tone="green" />
            <KpiCard label="Revenue this month" value={money(d.kpi.revenueThisMonthCents)} tone="gold" />
            <KpiCard label="Outstanding invoices" value={money(d.kpi.outstandingInvoiceCents)} tone="red" />
            <KpiCard label="Lead conversion" value={`${d.kpi.conversionRate}%`} />
            <KpiCard label="Active clients" value={String(d.kpi.activeClients)} />
            <KpiCard label="Active projects" value={String(d.kpi.activeProjects)} />
            <KpiCard label="Completed projects" value={String(d.kpi.completedProjects)} tone="green" />
            <KpiCard label="New leads" value={String(d.kpi.newLeads)} tone="gold" />
            <KpiCard label="Pending payments" value={String(d.kpi.pendingPayments)} tone="gold" />
            <KpiCard label="Website orders" value={String(d.kpi.websiteOrders)} />
            <KpiCard label="Open tickets" value={String(d.kpi.openTickets)} tone="red" />
            <KpiCard label="Services sold" value={String(d.charts.servicesSold.length)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel title="Monthly revenue">
              <Bars data={d.charts.revenueTrend.map((t) => ({ label: t.month, value: t.cents }))} format={money} />
            </AdminPanel>
            <AdminPanel title="Services sold">
              <Bars data={d.charts.servicesSold.map((s) => ({ label: s.name, value: s.cents }))} format={money} />
            </AdminPanel>
            <AdminPanel title="Lead sources">
              <Bars data={d.charts.leadSources.map((s) => ({ label: s.source, value: s.count }))} format={String} />
            </AdminPanel>
            <AdminPanel title="Recent website orders" action={<Link to="/admin/billing" className="text-xs text-muted-foreground hover:text-foreground">View billing</Link>}>
              <ul className="divide-y divide-border/60">
                {d.recentOrders.map((o, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{o.service_name}</div>
                      <div className="text-[11px] text-muted-foreground">{shortDate(o.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{money(o.amount_cents)}</span>
                      <StatusPill status={o.status} />
                    </div>
                  </li>
                ))}
                {d.recentOrders.length === 0 && <li className="py-2 text-xs text-muted-foreground">No orders yet.</li>}
              </ul>
            </AdminPanel>
          </div>
        </>
      )}
    </AdminShell>
  );
}
