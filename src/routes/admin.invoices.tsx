import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { listBilling, setInvoiceStatus } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, inputCls, btnGhost, downloadCsv, type Column } from "@/components/admin/table";

export const Route = createFileRoute("/admin/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — Hadees Trading Control Centre" },
      { name: "description", content: "Issue, track and reconcile every Hadees Trading invoice in one ledger." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InvoicesPage,
});

type Invoice = Awaited<ReturnType<typeof listBilling>>["invoices"][number];

const STATUSES = ["draft", "sent", "paid", "overdue", "void", "cancelled"] as const;

function InvoicesPage() {
  const fetchBilling = useServerFn(listBilling);
  const patchStatus = useServerFn(setInvoiceStatus);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "billing"], queryFn: () => fetchBilling({}) });
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");

  const mutate = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => patchStatus({ data: v }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "billing"] }),
  });

  const invoices = q.data?.invoices ?? [];
  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return invoices.filter((i) => {
      const okStatus = status === "all" || i.status === status;
      const okTerm = !t || [i.number, i.title].some((v) => (v ?? "").toLowerCase().includes(t));
      return okStatus && okTerm;
    });
  }, [invoices, term, status]);

  const totalBilled = invoices.reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const collected = invoices.reduce((s, i) => s + (i.amount_paid_cents ?? 0), 0);

  const cols: Column<Invoice>[] = [
    { key: "number", label: "Invoice", render: (i) => <span className="font-mono text-xs">{i.number}</span> },
    {
      key: "client", label: "Client", render: (i) => {
        const c = (i as { clients?: { full_name?: string; company_name?: string | null } | null }).clients;
        return <div><div>{c?.full_name ?? "—"}</div><div className="text-[11px] text-muted-foreground">{c?.company_name ?? ""}</div></div>;
      },
    },
    { key: "title", label: "Description", render: (i) => i.title },
    { key: "total", label: "Total", render: (i) => <span className="font-semibold">{money(i.total_cents)}</span> },
    { key: "paid", label: "Paid", render: (i) => <span className="text-muted-foreground">{money(i.amount_paid_cents)}</span> },
    { key: "due", label: "Due", render: (i) => <span className="text-[11px] text-muted-foreground">{shortDate(i.due_date)}</span> },
    { key: "status", label: "Status", render: (i) => <StatusPill status={i.status} /> },
    {
      key: "actions", label: "Set status", render: (i) => (
        <select
          className={inputCls}
          value={i.status}
          onChange={(e) => mutate.mutate({ id: i.id, status: e.target.value as (typeof STATUSES)[number] })}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
  ];

  return (
    <AdminShell title="Invoices" subtitle="Automatically generated on payment, plus anything you raise manually.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Invoices" value={String(invoices.length)} />
        <KpiCard label="Total billed" value={money(totalBilled)} tone="gold" />
        <KpiCard label="Collected" value={money(collected)} tone="green" />
        <KpiCard label="Outstanding" value={money(totalBilled - collected)} tone="red" />
      </div>

      <AdminPanel title="Invoice ledger">
        <Toolbar>
          <input className={inputCls} placeholder="Search number or description…" value={term} onChange={(e) => setTerm(e.target.value)} />
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["all", ...STATUSES].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className={btnGhost} onClick={() => downloadCsv("hadees-invoices.csv", rows as unknown as Record<string, unknown>[])}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </Toolbar>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading invoices…</p> : <DataTable rows={rows} cols={cols} empty="No invoices yet." />}
      </AdminPanel>
    </AdminShell>
  );
}
