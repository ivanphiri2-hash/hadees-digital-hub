import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { listBilling, setInvoiceStatus } from "@/lib/platform.functions";
import { deleteInvoice, patchInvoice, voidInvoice } from "@/lib/crm-admin.functions";
import { ConfirmDialog, ErrorBar, RowActions } from "@/components/admin/actions";
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
  const [edit, setEdit] = useState<{ id: string; title: string; due_date: string; notes: string } | null>(null);
  const [view, setView] = useState<Invoice | null>(null);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);
  const savePatch = useServerFn(patchInvoice);
  const doVoid = useServerFn(voidInvoice);
  const doDelete = useServerFn(deleteInvoice);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["admin", "billing"] });
  const mEdit = useMutation({ mutationFn: (v: { id: string; title: string; due_date: string | null; notes: string | null }) => savePatch({ data: v }), onSuccess: () => { setEdit(null); refresh(); } });
  const mVoid = useMutation({ mutationFn: (id: string) => doVoid({ data: { id } }), onSuccess: () => { setToDelete(null); refresh(); } });
  const mDel = useMutation({ mutationFn: (id: string) => doDelete({ data: { id } }), onSuccess: () => { setToDelete(null); refresh(); } });

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
    {
      key: "row", label: "Actions", render: (i) => (
        <RowActions
          onView={() => setView(i)}
          onEdit={() => setEdit({ id: i.id, title: i.title, due_date: i.due_date ?? "", notes: i.notes ?? "" })}
          onDelete={() => setToDelete(i)}
        />
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
        <ErrorBar error={mutate.error || mEdit.error ? new Error("Unable to update this record. No changes were saved.") : null} />
        {edit && (
          <form className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
            onSubmit={(e) => { e.preventDefault(); mEdit.mutate({ id: edit.id, title: edit.title, due_date: edit.due_date || null, notes: edit.notes || null }); }}>
            <div className="sm:col-span-3 text-[10px] uppercase tracking-widest text-muted-foreground">Edit invoice (amounts stay linked to recorded payments)</div>
            <input required className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            <input type="date" className={inputCls} value={edit.due_date} onChange={(e) => setEdit({ ...edit, due_date: e.target.value })} />
            <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Notes" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
            <div className="sm:col-span-3 flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-royal)] px-4 py-2 text-xs font-semibold text-white" disabled={mEdit.isPending}>Save changes</button>
              <button type="button" className={btnGhost} onClick={() => setEdit(null)}>Cancel</button>
            </div>
          </form>
        )}
        {view && (
          <div className="mb-4 rounded-xl border border-border/60 p-4 text-sm">
            <div className="flex items-center justify-between"><span className="font-mono">{view.number}</span><button className={btnGhost} onClick={() => setView(null)}>Close</button></div>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
              <div>{view.title}</div>
              <div>Total {money(view.total_cents)} · Paid {money(view.amount_paid_cents)} · Balance {money(view.total_cents - view.amount_paid_cents)}</div>
              <div>Status {view.status} · Due {shortDate(view.due_date)}</div>
              {view.notes && <div className="whitespace-pre-wrap">{view.notes}</div>}
            </div>
          </div>
        )}
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading invoices…</p> : <DataTable rows={rows} cols={cols} empty="No invoices yet." />}
      </AdminPanel>
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this invoice?"
        message={`Are you sure you want to delete ${toDelete?.number ?? "this invoice"}? This action cannot be undone. Invoices with payments can only be voided.`}
        pending={mDel.isPending || mVoid.isPending}
        error={mDel.error instanceof Error ? mDel.error.message : mVoid.error ? "Unable to update this record. No changes were saved." : null}
        onCancel={() => { mDel.reset(); setToDelete(null); }}
        onConfirm={() => toDelete && mDel.mutate(toDelete.id)}
      >
        {toDelete && <button className={`${btnGhost} mt-3`} onClick={() => mVoid.mutate(toDelete.id)}>Void instead (keeps history)</button>}
      </ConfirmDialog>
    </AdminShell>
  );
}
