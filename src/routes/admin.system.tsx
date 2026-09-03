import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

import { getSystemHealth, retryOrderAutomation } from "@/lib/system.functions";
import { AdminShell, AdminPanel, KpiCard, StatusPill, money, shortDate } from "@/components/admin/shell";

export const Route = createFileRoute("/admin/system")({
  head: () => ({
    meta: [
      { title: "System Health & Payment Audit — Hadees Trading Admin" },
      { name: "description", content: "PayFast status, ITN monitoring, automation failures and full payment-to-project audit trail." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SystemHealth,
});

function Cell({ value }: { value: string | null }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />{value}</span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

function SystemHealth() {
  const fetchHealth = useServerFn(getSystemHealth);
  const retry = useServerFn(retryOrderAutomation);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin", "system-health"], queryFn: () => fetchHealth({}) });
  const m = useMutation({
    mutationFn: (order_id: string) => retry({ data: { order_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "system-health"] }),
  });

  const d = q.data;

  return (
    <AdminShell title="System Health" subtitle="PayFast, ITN, automation monitoring and end-to-end payment audit — all from live records.">
      {q.isLoading && <p className="text-sm text-muted-foreground">Checking system…</p>}
      {q.error && <p className="text-sm text-red-400">{(q.error as Error).message}</p>}

      {d && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard label="PayFast mode" value={d.payfast.mode.toUpperCase()} tone="green" />
            <KpiCard label="Orders tracked" value={String(d.counters.orders)} />
            <KpiCard label="Verified paid" value={String(d.counters.paid)} tone="green" />
            <KpiCard label="Pending" value={String(d.counters.pending)} tone="gold" />
            <KpiCard label="ITNs received" value={String(d.counters.itnReceived)} />
            <KpiCard label="Automation gaps" value={String(d.counters.failedAutomations)} tone={d.counters.failedAutomations ? "red" : "green"} />
          </div>

          {!d.email.configured && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">Email sending domain not configured</div>
                <p className="text-amber-200/80">{d.email.note} No email is ever reported as sent until delivery is real.</p>
              </div>
            </div>
          )}

          {d.failedAutomations.length > 0 && (
            <AdminPanel title="Failed / incomplete automations">
              <ul className="divide-y divide-border/60">
                {d.failedAutomations.map((a) => (
                  <li key={a.order_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{a.service_name} · {a.reference}</div>
                      <div className="text-[11px] text-red-300">Missing: {a.missing.join(", ")}</div>
                    </div>
                    <button
                      onClick={() => m.mutate(a.order_id)}
                      disabled={m.isPending}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-royal)] px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${m.isPending ? "animate-spin" : ""}`} /> Retry safely
                    </button>
                  </li>
                ))}
              </ul>
              {m.error && <p className="mt-2 text-xs text-red-400">{(m.error as Error).message}</p>}
            </AdminPanel>
          )}

          <AdminPanel title="Payment audit trail — PayFast → order → payment → invoice → receipt → project">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">Reference</th>
                    <th className="py-2 pr-3">Client</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">ITN</th>
                    <th className="py-2 pr-3">Invoice</th>
                    <th className="py-2 pr-3">Receipt</th>
                    <th className="py-2 pr-3">Project</th>
                    <th className="py-2 pr-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {d.audit.map((a) => (
                    <tr key={a.order_id}>
                      <td className="py-2.5 pr-3 font-mono text-[11px]">{a.reference}</td>
                      <td className="py-2.5 pr-3">{a.customer_name}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{money(a.amount_cents)}</td>
                      <td className="py-2.5 pr-3"><StatusPill status={a.status} /></td>
                      <td className="py-2.5 pr-3">{a.itn_received ? <span className="text-emerald-300">received</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="py-2.5 pr-3"><Cell value={a.invoice_number} /></td>
                      <td className="py-2.5 pr-3"><Cell value={a.receipt_number} /></td>
                      <td className="py-2.5 pr-3"><Cell value={a.project_name} /></td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{shortDate(a.created_at)}</td>
                    </tr>
                  ))}
                  {d.audit.length === 0 && (
                    <tr><td colSpan={9} className="py-3 text-muted-foreground">No orders recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminPanel>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel title="Recent notifications">
              <ul className="divide-y divide-border/60">
                {d.notifications.map((n) => (
                  <li key={n.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                    <span className="truncate">{n.title}</span>
                    <span className="text-muted-foreground">{shortDate(n.created_at)}</span>
                  </li>
                ))}
                {d.notifications.length === 0 && <li className="py-2 text-xs text-muted-foreground">None yet.</li>}
              </ul>
            </AdminPanel>
            <AdminPanel title="Recent system activity">
              <ul className="divide-y divide-border/60">
                {d.activity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                    <span className="truncate">{a.action} {a.entity_type ? `· ${a.entity_type}` : ""}</span>
                    <span className="text-muted-foreground">{shortDate(a.created_at)}</span>
                  </li>
                ))}
                {d.activity.length === 0 && <li className="py-2 text-xs text-muted-foreground">None yet.</li>}
              </ul>
            </AdminPanel>
          </div>
        </>
      )}
    </AdminShell>
  );
}
