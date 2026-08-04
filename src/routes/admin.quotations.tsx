import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileCheck2 } from "lucide-react";
import { listBilling, setQuotationStatus, convertQuotationToInvoice } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, inputCls, btnCls, btnGhost, downloadCsv, type Column } from "@/components/admin/table";

export const Route = createFileRoute("/admin/quotations")({
  head: () => ({
    meta: [
      { title: "Quotations — Hadees Trading Control Centre" },
      { name: "description", content: "Issue quotations, track approvals and convert accepted quotes into invoices." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuotationsPage,
});

type Quote = Awaited<ReturnType<typeof listBilling>>["quotations"][number];

function QuotationsPage() {
  const fetchBilling = useServerFn(listBilling);
  const patchStatus = useServerFn(setQuotationStatus);
  const convert = useServerFn(convertQuotationToInvoice);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "billing"], queryFn: () => fetchBilling({}) });
  const [term, setTerm] = useState("");

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "billing"] });
  const statusM = useMutation({
    mutationFn: (v: { id: string; status: "draft" | "sent" | "accepted" | "rejected" | "void" }) => patchStatus({ data: v }),
    onSuccess: invalidate,
  });
  const convertM = useMutation({ mutationFn: (id: string) => convert({ data: { id } }), onSuccess: invalidate });

  const quotes = q.data?.quotations ?? [];
  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return quotes.filter((x) => !t || [x.number, x.title].some((v) => (v ?? "").toLowerCase().includes(t)));
  }, [quotes, term]);

  const accepted = quotes.filter((x) => x.status === "accepted");

  const cols: Column<Quote>[] = [
    { key: "number", label: "Quote", render: (x) => <span className="font-mono text-xs">{x.number}</span> },
    {
      key: "client", label: "Client", render: (x) => {
        const c = (x as { clients?: { full_name?: string } | null }).clients;
        return c?.full_name ?? "—";
      },
    },
    { key: "title", label: "Description", render: (x) => x.title },
    { key: "total", label: "Total", render: (x) => <span className="font-semibold">{money(x.total_cents)}</span> },
    { key: "valid", label: "Valid until", render: (x) => <span className="text-[11px] text-muted-foreground">{shortDate(x.valid_until)}</span> },
    { key: "status", label: "Status", render: (x) => <StatusPill status={x.status} /> },
    {
      key: "actions", label: "Actions", render: (x) => (
        <div className="flex flex-wrap gap-1.5">
          {x.status !== "accepted" && (
            <button className={btnGhost} onClick={() => statusM.mutate({ id: x.id, status: "accepted" })}>Approve</button>
          )}
          {x.status !== "rejected" && (
            <button className={btnGhost} onClick={() => statusM.mutate({ id: x.id, status: "rejected" })}>Reject</button>
          )}
          <button className={btnCls} disabled={convertM.isPending} onClick={() => convertM.mutate(x.id)}>
            <FileCheck2 className="h-3.5 w-3.5" /> To invoice
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Quotations" subtitle="QTN-YYYY-000000 numbering, approvals and one-click conversion to invoices.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Quotations" value={String(quotes.length)} />
        <KpiCard label="Accepted" value={String(accepted.length)} tone="green" />
        <KpiCard label="Awaiting response" value={String(quotes.filter((x) => x.status === "sent").length)} tone="gold" />
        <KpiCard label="Accepted value" value={money(accepted.reduce((s, x) => s + (x.total_cents ?? 0), 0))} tone="green" />
      </div>

      <AdminPanel title="Quotation register">
        <Toolbar>
          <input className={inputCls} placeholder="Search number or description…" value={term} onChange={(e) => setTerm(e.target.value)} />
          <button className={btnGhost} onClick={() => downloadCsv("hadees-quotations.csv", rows as unknown as Record<string, unknown>[])}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </Toolbar>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading quotations…</p> : <DataTable rows={rows} cols={cols} empty="No quotations yet." />}
        {convertM.error && <p className="mt-3 text-xs text-red-400">{(convertM.error as Error).message}</p>}
      </AdminPanel>
    </AdminShell>
  );
}
