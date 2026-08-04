import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { getAdminOverview, listBilling } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, money } from "@/components/admin/shell";
import { btnGhost, downloadCsv } from "@/components/admin/table";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Hadees Trading Control Centre" },
      { name: "description", content: "Revenue, sales, conversion and service performance reports with CSV export." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReportsPage,
});

function Bars({ data, format }: { data: { label: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="grid gap-2">
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[130px_1fr_auto] items-center gap-3 text-xs">
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

function ReportsPage() {
  const fetchOverview = useServerFn(getAdminOverview);
  const fetchBilling = useServerFn(listBilling);
  const o = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fetchOverview({}) });
  const b = useQuery({ queryKey: ["admin", "billing"], queryFn: () => fetchBilling({}) });

  const d = o.data;
  const billing = b.data;

  return (
    <AdminShell title="Reports" subtitle="Revenue, sales, conversion and service performance — exportable for your accountant.">
      {o.isLoading && <p className="text-sm text-muted-foreground">Building reports…</p>}

      {d && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total revenue" value={money(d.kpi.revenueCents)} tone="green" />
            <KpiCard label="Revenue this month" value={money(d.kpi.revenueThisMonthCents)} tone="gold" />
            <KpiCard label="Outstanding" value={money(d.kpi.outstandingInvoiceCents)} tone="red" />
            <KpiCard label="Conversion rate" value={`${d.kpi.conversionRate}%`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel
              title="Revenue report"
              action={<button className={btnGhost} onClick={() => downloadCsv("revenue-report.csv", d.charts.revenueTrend.map((t) => ({ month: t.month, revenue_zar: (t.cents / 100).toFixed(2) })))}><Download className="h-3.5 w-3.5" /> CSV</button>}
            >
              <Bars data={d.charts.revenueTrend.map((t) => ({ label: t.month, value: t.cents }))} format={money} />
            </AdminPanel>

            <AdminPanel
              title="Top selling services"
              action={<button className={btnGhost} onClick={() => downloadCsv("services-report.csv", d.charts.servicesSold.map((s) => ({ service: s.name, revenue_zar: (s.cents / 100).toFixed(2) })))}><Download className="h-3.5 w-3.5" /> CSV</button>}
            >
              <Bars data={d.charts.servicesSold.map((s) => ({ label: s.name, value: s.cents }))} format={money} />
            </AdminPanel>

            <AdminPanel
              title="Lead sources"
              action={<button className={btnGhost} onClick={() => downloadCsv("lead-sources.csv", d.charts.leadSources.map((s) => ({ source: s.source, leads: s.count })))}><Download className="h-3.5 w-3.5" /> CSV</button>}
            >
              <Bars data={d.charts.leadSources.map((s) => ({ label: s.source, value: s.count }))} format={String} />
            </AdminPanel>

            <AdminPanel title="Data exports">
              <p className="mb-3 text-xs text-muted-foreground">Download raw ledgers for accounting, SARS submissions or Excel analysis.</p>
              <div className="flex flex-wrap gap-2">
                <button className={btnGhost} disabled={!billing} onClick={() => downloadCsv("invoices.csv", (billing?.invoices ?? []) as unknown as Record<string, unknown>[])}>Invoices</button>
                <button className={btnGhost} disabled={!billing} onClick={() => downloadCsv("payments.csv", (billing?.payments ?? []) as unknown as Record<string, unknown>[])}>Payments</button>
                <button className={btnGhost} disabled={!billing} onClick={() => downloadCsv("receipts.csv", (billing?.receipts ?? []) as unknown as Record<string, unknown>[])}>Receipts</button>
                <button className={btnGhost} disabled={!billing} onClick={() => downloadCsv("quotations.csv", (billing?.quotations ?? []) as unknown as Record<string, unknown>[])}>Quotations</button>
                <button className={btnGhost} disabled={!billing} onClick={() => downloadCsv("orders.csv", (billing?.orders ?? []) as unknown as Record<string, unknown>[])}>Orders</button>
              </div>
            </AdminPanel>
          </div>
        </>
      )}
    </AdminShell>
  );
}
