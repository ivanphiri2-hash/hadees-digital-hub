import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import {
  convertQuotationToInvoice, createInvoice, createQuotation, listBilling, listClients,
  recordPayment, setInvoiceStatus, setQuotationStatus,
} from "@/lib/platform.functions";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/admin/billing")({
  head: () => ({
    meta: [
      { title: "Billing — Hadees Trading Control Centre" },
      { name: "description", content: "Quotations, invoices, receipts and outstanding balances for Hadees Trading clients." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BillingPage,
});

type Tab = "invoices" | "quotations" | "payments" | "receipts" | "orders";
const TABS: Tab[] = ["invoices", "quotations", "payments", "receipts", "orders"];

interface LineItem { description: string; qty: number; unit_cents: number }

function BillingPage() {
  const qc = useQueryClient();
  const fetchBilling = useServerFn(listBilling);
  const fetchClients = useServerFn(listClients);
  const mkInvoice = useServerFn(createInvoice);
  const mkQuote = useServerFn(createQuotation);
  const invStatus = useServerFn(setInvoiceStatus);
  const quoStatus = useServerFn(setQuotationStatus);
  const convert = useServerFn(convertQuotationToInvoice);
  const pay = useServerFn(recordPayment);

  const [tab, setTab] = useState<Tab>("invoices");
  const [open, setOpen] = useState<"invoice" | "quote" | null>(null);

  const billing = useQuery({ queryKey: ["admin", "billing"], queryFn: () => fetchBilling({}) });
  const clients = useQuery({ queryKey: ["admin", "clients"], queryFn: () => fetchClients({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "billing"] });

  const mInvoice = useMutation({ mutationFn: (v: { client_id: string | null; title: string; line_items: LineItem[]; vat: boolean; due_date: string | null }) => mkInvoice({ data: v }), onSuccess: () => { setOpen(null); invalidate(); } });
  const mQuote = useMutation({ mutationFn: (v: { client_id: string | null; title: string; line_items: LineItem[]; vat: boolean; valid_until: string | null }) => mkQuote({ data: v }), onSuccess: () => { setOpen(null); invalidate(); } });
  const mInvStatus = useMutation({ mutationFn: (v: { id: string; status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "void" }) => invStatus({ data: v }), onSuccess: invalidate });
  const mQuoStatus = useMutation({ mutationFn: (v: { id: string; status: "draft" | "sent" | "accepted" | "rejected" }) => quoStatus({ data: v }), onSuccess: invalidate });
  const mConvert = useMutation({ mutationFn: (id: string) => convert({ data: { id } }), onSuccess: invalidate });
  const mPay = useMutation({ mutationFn: (v: { invoice_id: string; amount_cents: number; method: "eft"; reference?: string }) => pay({ data: v }), onSuccess: invalidate });

  const d = billing.data;
  const clientOptions = (clients.data ?? []).map((c) => ({ id: c.id, label: c.company_name || c.full_name }));

  const outstanding = (d?.invoices ?? []).reduce((s, i) => s + (i.status === "paid" || i.status === "void" ? 0 : i.total_cents - i.amount_paid_cents), 0);

  return (
    <AdminShell title="Billing" subtitle="Quotations, invoices, receipts and payment reconciliation.">
      <AdminPanel
        title="Documents"
        action={
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-red-500/15 px-3 py-1.5 text-[11px] font-semibold text-red-300">Outstanding {money(outstanding)}</span>
            <button className={btnCls} onClick={() => setOpen(open === "quote" ? null : "quote")}><Plus className="h-3.5 w-3.5" /> Quotation</button>
            <button className={btnCls} onClick={() => setOpen(open === "invoice" ? null : "invoice")}><Plus className="h-3.5 w-3.5" /> Invoice</button>
          </div>
        }
      >
        {open && (
          <DocForm
            kind={open}
            clients={clientOptions}
            pending={mInvoice.isPending || mQuote.isPending}
            onSubmit={(v) => {
              if (open === "invoice") mInvoice.mutate({ client_id: v.client_id, title: v.title, line_items: v.line_items, vat: v.vat, due_date: v.date });
              else mQuote.mutate({ client_id: v.client_id, title: v.title, line_items: v.line_items, vat: v.vat, valid_until: v.date });
            }}
          />
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${tab === t ? "bg-[var(--color-royal)] text-white" : "border border-border/70 text-muted-foreground"}`}>
              {t}
            </button>
          ))}
          <button className={`${btnGhost} ml-auto`} onClick={() => downloadCsv(`hadees-${tab}.csv`, (d?.[tab] ?? []) as unknown as Record<string, unknown>[])}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>

        {tab === "invoices" && (
          <DataTable
            rows={d?.invoices ?? []}
            empty="No invoices yet."
            cols={[
              { key: "n", label: "Number", render: (i) => <span className="font-mono text-xs">{i.number}</span> },
              { key: "c", label: "Client", render: (i) => <span className="text-xs">{i.clients?.company_name || i.clients?.full_name || "—"}</span> },
              { key: "t", label: "Title", render: (i) => <span className="text-xs">{i.title}</span> },
              { key: "tot", label: "Total", render: (i) => money(i.total_cents) },
              { key: "bal", label: "Balance", render: (i) => money(i.total_cents - i.amount_paid_cents) },
              { key: "due", label: "Due", render: (i) => <span className="text-xs">{shortDate(i.due_date)}</span> },
              { key: "s", label: "Status", render: (i) => (
                <select className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]" value={i.status}
                  onChange={(e) => mInvStatus.mutate({ id: i.id, status: e.target.value as "paid" })}>
                  {["draft", "sent", "paid", "overdue", "cancelled", "void"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) },
              { key: "a", label: "", render: (i) => (
                <span className="flex gap-2">
                  <button className={btnGhost} onClick={() => window.print()}>PDF</button>
                  <a className={btnGhost} href={`mailto:?subject=${encodeURIComponent(`${i.number} from ${COMPANY.legalName}`)}&body=${encodeURIComponent(`Invoice ${i.number} — ${money(i.total_cents)} due ${i.due_date ?? "on receipt"}.`)}`}>Email</a>
                  <button className={btnGhost} onClick={() => {
                    const v = prompt("Amount received (ZAR)", String((i.total_cents - i.amount_paid_cents) / 100));
                    if (v) mPay.mutate({ invoice_id: i.id, amount_cents: Math.round(Number(v) * 100), method: "eft" });
                  }}>Record payment</button>
                </span>
              ) },
            ]}
          />
        )}

        {tab === "quotations" && (
          <DataTable
            rows={d?.quotations ?? []}
            empty="No quotations yet."
            cols={[
              { key: "n", label: "Number", render: (i) => <span className="font-mono text-xs">{i.number}</span> },
              { key: "c", label: "Client", render: (i) => <span className="text-xs">{i.clients?.company_name || i.clients?.full_name || "—"}</span> },
              { key: "t", label: "Title", render: (i) => <span className="text-xs">{i.title}</span> },
              { key: "tot", label: "Total", render: (i) => money(i.total_cents) },
              { key: "v", label: "Valid until", render: (i) => <span className="text-xs">{shortDate(i.valid_until)}</span> },
              { key: "s", label: "Status", render: (i) => (
                <select className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]" value={i.status}
                  onChange={(e) => mQuoStatus.mutate({ id: i.id, status: e.target.value as "sent" })}>
                  {["draft", "sent", "accepted", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) },
              { key: "a", label: "", render: (i) => <button className={btnGhost} onClick={() => mConvert.mutate(i.id)}>Convert to invoice</button> },
            ]}
          />
        )}

        {tab === "payments" && (
          <DataTable rows={d?.payments ?? []} empty="No payments recorded." cols={[
            { key: "d", label: "Date", render: (p) => <span className="text-xs">{shortDate(p.paid_at ?? p.created_at)}</span> },
            { key: "a", label: "Amount", render: (p) => money(p.amount_cents) },
            { key: "m", label: "Method", render: (p) => <span className="text-xs capitalize">{p.method}</span> },
            { key: "r", label: "Reference", render: (p) => <span className="font-mono text-[11px]">{p.reference || p.pf_payment_id || "—"}</span> },
            { key: "s", label: "Status", render: (p) => <StatusPill status={p.status} /> },
          ]} />
        )}

        {tab === "receipts" && (
          <DataTable rows={d?.receipts ?? []} empty="No receipts issued." cols={[
            { key: "n", label: "Number", render: (r) => <span className="font-mono text-xs">{r.number}</span> },
            { key: "a", label: "Amount", render: (r) => money(r.amount_cents) },
            { key: "d", label: "Issued", render: (r) => <span className="text-xs">{shortDate(r.issued_at)}</span> },
          ]} />
        )}

        {tab === "orders" && (
          <DataTable rows={d?.orders ?? []} empty="No website orders yet." cols={[
            { key: "r", label: "Reference", render: (o) => <span className="font-mono text-xs">{o.reference}</span> },
            { key: "s", label: "Service", render: (o) => <span className="text-xs">{o.service_name}</span> },
            { key: "c", label: "Customer", render: (o) => <div className="text-[11px] text-muted-foreground"><div>{o.customer_name}</div><div>{o.customer_email}</div></div> },
            { key: "a", label: "Amount", render: (o) => money(o.amount_cents) },
            { key: "d", label: "Date", render: (o) => <span className="text-xs">{shortDate(o.created_at)}</span> },
            { key: "st", label: "Status", render: (o) => <StatusPill status={o.status} /> },
          ]} />
        )}
      </AdminPanel>
    </AdminShell>
  );
}

function DocForm({ kind, clients, onSubmit, pending }: {
  kind: "invoice" | "quote";
  clients: { id: string; label: string }[];
  onSubmit: (v: { client_id: string | null; title: string; line_items: LineItem[]; vat: boolean; date: string | null }) => void;
  pending: boolean;
}) {
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [vat, setVat] = useState(false);
  const [items, setItems] = useState<{ description: string; qty: string; unit: string }[]>([{ description: "", qty: "1", unit: "" }]);

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * Math.round((Number(i.unit) || 0) * 100), 0);
  const total = subtotal + (vat ? Math.round(subtotal * 0.15) : 0);

  return (
    <form
      className="mb-5 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          client_id: clientId || null,
          title,
          vat,
          date: date || null,
          line_items: items.filter((i) => i.description.trim()).map((i) => ({
            description: i.description, qty: Number(i.qty) || 1, unit_cents: Math.round((Number(i.unit) || 0) * 100),
          })),
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <input required className={inputCls} placeholder={`${kind === "invoice" ? "Invoice" : "Quotation"} title`} value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className={inputCls} value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">No client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {items.map((it, idx) => (
        <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_90px_140px]">
          <input className={inputCls} placeholder="Description" value={it.description}
            onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
          <input className={inputCls} type="number" min="1" placeholder="Qty" value={it.qty}
            onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, qty: e.target.value } : x))} />
          <input className={inputCls} type="number" min="0" step="0.01" placeholder="Unit (ZAR)" value={it.unit}
            onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))} />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnGhost} onClick={() => setItems([...items, { description: "", qty: "1", unit: "" }])}>Add line</button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} /> Add 15% VAT
        </label>
        <span className="text-xs text-muted-foreground">Total <strong className="text-foreground">{money(total)}</strong></span>
        <button className={btnCls} disabled={pending}>Create {kind}</button>
      </div>
    </form>
  );
}
