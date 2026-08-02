import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { deleteClient, getClientDetail, listClients, setClientStatus, upsertClient } from "@/lib/platform.functions";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Hadees Trading Control Centre" },
      { name: "description", content: "Full client records: business details, projects, invoices, payments, documents and support history." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const fetchClients = useServerFn(listClients);
  const fetchDetail = useServerFn(getClientDetail);
  const save = useServerFn(upsertClient);
  const setStatus = useServerFn(setClientStatus);
  const remove = useServerFn(deleteClient);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const q = useQuery({ queryKey: ["admin", "clients"], queryFn: () => fetchClients({}) });
  const detail = useQuery({
    queryKey: ["admin", "client", selected],
    queryFn: () => fetchDetail({ data: { id: selected! } }),
    enabled: !!selected,
  });
  const invalidate = () => { void qc.invalidateQueries({ queryKey: ["admin", "clients"] }); void qc.invalidateQueries({ queryKey: ["admin", "client"] }); };

  const mSave = useMutation({ mutationFn: (v: Parameters<typeof save>[0]["data"]) => save({ data: v }), onSuccess: () => { setOpen(false); invalidate(); } });
  const mStatus = useMutation({ mutationFn: (v: { id: string; status: "active" | "prospect" | "dormant" | "suspended" | "archived" }) => setStatus({ data: v }), onSuccess: invalidate });
  const mDelete = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: () => { setSelected(null); invalidate(); } });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return q.data ?? [];
    return (q.data ?? []).filter((c) =>
      [c.full_name, c.company_name, c.email, c.phone, c.industry].some((v) => (v ?? "").toLowerCase().includes(term)));
  }, [q.data, search]);

  return (
    <AdminShell title="Clients" subtitle="Every client relationship, contract and balance in one record.">
      <AdminPanel
        title={`Client database (${rows.length})`}
        action={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => downloadCsv("hadees-clients.csv", rows as unknown as Record<string, unknown>[])}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button className={btnCls} onClick={() => setOpen((v) => !v)}><Plus className="h-3.5 w-3.5" /> New client</button>
          </div>
        }
      >
        {open && <ClientForm pending={mSave.isPending} onSubmit={(v) => mSave.mutate(v)} />}

        <Toolbar>
          <input className={inputCls} placeholder="Search client, company, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No clients yet — convert a lead or take a PayFast order."
          cols={[
            { key: "name", label: "Client", render: (c) => (
              <button className="text-left" onClick={() => setSelected(c.id)}>
                <div className="font-medium">{c.full_name}</div>
                <div className="text-[11px] text-muted-foreground">{c.company_name || "—"}</div>
              </button>
            ) },
            { key: "contact", label: "Contact", render: (c) => <div className="text-[11px] text-muted-foreground"><div>{c.email}</div><div>{c.phone || "—"}</div></div> },
            { key: "industry", label: "Industry", render: (c) => <span className="text-xs">{c.industry || "—"}</span> },
            { key: "ltv", label: "Lifetime value", render: (c) => money(c.lifetime_value_cents) },
            { key: "since", label: "Client since", render: (c) => <span className="text-xs">{shortDate(c.created_at)}</span> },
            { key: "status", label: "Status", render: (c) => (
              <select className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]" value={c.status}
                onChange={(e) => mStatus.mutate({ id: c.id, status: e.target.value as "active" })}>
                {["active", "prospect", "dormant", "suspended", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) },
          ]}
        />
      </AdminPanel>

      {selected && detail.data && (
        <AdminPanel
          title={`${detail.data.client.full_name} — profile`}
          action={
            <div className="flex gap-2">
              {user?.isAdmin && (
                <button className={btnGhost} onClick={() => { if (confirm("Delete this client permanently?")) mDelete.mutate(selected); }}>Delete</button>
              )}
              <button className={btnGhost} onClick={() => setSelected(null)}>Close</button>
            </div>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Email" value={detail.data.client.email} />
            <Info label="Phone" value={detail.data.client.phone || "—"} />
            <Info label="WhatsApp" value={detail.data.client.whatsapp || "—"} />
            <Info label="Company" value={detail.data.client.company_name || "—"} />
            <Info label="Reg number" value={detail.data.client.registration_number || "—"} />
            <Info label="VAT number" value={detail.data.client.vat_number || "—"} />
            <Info label="Address" value={detail.data.client.address || "—"} />
            <Info label="Industry" value={detail.data.client.industry || "—"} />
            <Info label="Outstanding" value={money(detail.data.invoices.reduce((s, i) => s + (i.status === "paid" ? 0 : i.total_cents - i.amount_paid_cents), 0))} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <MiniList title="Projects" items={detail.data.projects.map((p) => ({ id: p.id, main: p.name, sub: `${p.progress}% complete`, pill: p.status }))} />
            <MiniList title="Invoices" items={detail.data.invoices.map((i) => ({ id: i.id, main: `${i.number} · ${money(i.total_cents)}`, sub: i.title, pill: i.status }))} />
            <MiniList title="Quotations" items={detail.data.quotations.map((i) => ({ id: i.id, main: `${i.number} · ${money(i.total_cents)}`, sub: i.title, pill: i.status }))} />
            <MiniList title="Payments" items={detail.data.payments.map((p) => ({ id: p.id, main: money(p.amount_cents), sub: `${p.method} · ${shortDate(p.paid_at ?? p.created_at)}`, pill: p.status }))} />
            <MiniList title="Documents" items={detail.data.documents.map((d) => ({ id: d.id, main: d.name, sub: d.category, pill: `v${d.version}` }))} />
            <MiniList title="Support tickets" items={detail.data.tickets.map((t) => ({ id: t.id, main: t.subject, sub: t.priority, pill: t.status }))} />
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Timeline</h3>
            <ul className="grid gap-1.5">
              {detail.data.activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs">
                  <span>{a.action}</span><span className="text-muted-foreground">{shortDate(a.created_at)}</span>
                </li>
              ))}
              {detail.data.activity.length === 0 && <li className="text-xs text-muted-foreground">No recorded activity.</li>}
            </ul>
          </div>
        </AdminPanel>
      )}
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words text-sm">{value}</div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: { id: string; main: string; sub: string; pill: string }[] }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <h3 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">{title}</h3>
      <ul className="grid gap-1.5">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0"><div className="truncate font-medium">{i.main}</div><div className="truncate text-[11px] text-muted-foreground">{i.sub}</div></div>
            <StatusPill status={i.pill} />
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-muted-foreground">None.</li>}
      </ul>
    </div>
  );
}

function ClientForm({ onSubmit, pending }: { onSubmit: (v: { full_name: string; email: string; phone?: string; whatsapp?: string; company_name?: string; registration_number?: string; vat_number?: string; address?: string; industry?: string; notes?: string; status: "active" }) => void; pending: boolean }) {
  const [f, setF] = useState({ full_name: "", email: "", phone: "", whatsapp: "", company_name: "", registration_number: "", vat_number: "", address: "", industry: "", notes: "" });
  return (
    <form
      className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
      onSubmit={(e) => { e.preventDefault(); onSubmit({ ...f, status: "active" }); }}
    >
      <input required className={inputCls} placeholder="Full name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
      <input required type="email" className={inputCls} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={inputCls} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <input className={inputCls} placeholder="WhatsApp" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} />
      <input className={inputCls} placeholder="Company name" value={f.company_name} onChange={(e) => setF({ ...f, company_name: e.target.value })} />
      <input className={inputCls} placeholder="Registration number" value={f.registration_number} onChange={(e) => setF({ ...f, registration_number: e.target.value })} />
      <input className={inputCls} placeholder="VAT number" value={f.vat_number} onChange={(e) => setF({ ...f, vat_number: e.target.value })} />
      <input className={inputCls} placeholder="Industry" value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} />
      <input className={inputCls} placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Internal notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <button className={btnCls} disabled={pending}>Save client</button>
    </form>
  );
}
