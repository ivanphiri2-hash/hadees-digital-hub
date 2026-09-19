import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { ConfirmDialog, ErrorBar, RowActions } from "@/components/admin/actions";
import { getClientDetail, listClients, setClientStatus, upsertClient } from "@/lib/platform.functions";
import { archiveClient, deleteClientSafe, findClientDuplicates, getClientRelations } from "@/lib/crm-admin.functions";
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

type Client = Awaited<ReturnType<typeof listClients>>[number];

interface ClientInput {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  company_name?: string;
  registration_number?: string;
  vat_number?: string;
  address?: string;
  industry?: string;
  notes?: string;
  status: "active" | "prospect" | "dormant";
}

const STATUSES = ["active", "prospect", "dormant", "suspended", "archived"] as const;

function ClientsPage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const fetchClients = useServerFn(listClients);
  const fetchDetail = useServerFn(getClientDetail);
  const save = useServerFn(upsertClient);
  const setStatus = useServerFn(setClientStatus);
  const archive = useServerFn(archiveClient);
  const remove = useServerFn(deleteClientSafe);
  const relations = useServerFn(getClientRelations);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active_only");
  const [editing, setEditing] = useState<ClientInput | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);

  const q = useQuery({ queryKey: ["admin", "clients"], queryFn: () => fetchClients({}) });
  const detail = useQuery({
    queryKey: ["admin", "client", selected],
    queryFn: () => fetchDetail({ data: { id: selected! } }),
    enabled: !!selected,
  });
  const rel = useQuery({
    queryKey: ["admin", "client-relations", toDelete?.id],
    queryFn: () => relations({ data: { id: toDelete!.id } }),
    enabled: !!toDelete,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    void qc.invalidateQueries({ queryKey: ["admin", "client"] });
  };

  const mSave = useMutation({ mutationFn: (v: ClientInput) => save({ data: v }), onSuccess: () => { setEditing(null); invalidate(); } });
  const mStatus = useMutation({ mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => setStatus({ data: v }), onSuccess: invalidate });
  const mArchive = useMutation({ mutationFn: (v: { id: string; archived: boolean }) => archive({ data: v }), onSuccess: invalidate });
  const mDelete = useMutation({
    mutationFn: (id: string) => remove({ data: { id, force: false } }),
    onSuccess: () => { setToDelete(null); setSelected(null); invalidate(); },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (q.data ?? []).filter((c) => {
      if (statusFilter === "active_only" && c.status === "archived") return false;
      if (statusFilter !== "active_only" && statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!term) return true;
      return [c.client_number, c.full_name, c.company_name, c.email, c.phone, c.industry]
        .some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [q.data, search, statusFilter]);

  const toInput = (c: Client): ClientInput => ({
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone ?? "",
    whatsapp: c.whatsapp ?? "",
    company_name: c.company_name ?? "",
    registration_number: c.registration_number ?? "",
    vat_number: c.vat_number ?? "",
    address: c.address ?? "",
    industry: c.industry ?? "",
    notes: c.notes ?? "",
    status: (["active", "prospect", "dormant"].includes(c.status) ? c.status : "active") as ClientInput["status"],
  });

  return (
    <AdminShell title="Clients" subtitle="Every client relationship, contract and balance in one record.">
      <AdminPanel
        title={`Client database (${rows.length})`}
        action={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => downloadCsv("hadees-clients.csv", rows as unknown as Record<string, unknown>[])}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button className={btnCls} onClick={() => setEditing({ full_name: "", email: "", status: "active" })}>
              <Plus className="h-3.5 w-3.5" /> New client
            </button>
          </div>
        }
      >
        <ErrorBar error={mSave.error ?? mStatus.error ?? mArchive.error} />

        {editing && (
          <ClientForm
            value={editing}
            pending={mSave.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => mSave.mutate(v)}
            onOpenExisting={(id) => { setEditing(null); setSelected(id); }}
          />
        )}

        <Toolbar>
          <input className={inputCls} placeholder="Search number, client, company, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="active_only">Active (hide archived)</option>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No clients match this filter."
          cols={[
            { key: "number", label: "No.", render: (c) => (
              <span className="font-mono text-xs text-[var(--color-gold)]">{c.client_number ?? "—"}</span>
            ) },
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
                onChange={(e) => mStatus.mutate({ id: c.id, status: e.target.value as (typeof STATUSES)[number] })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) },
            { key: "actions", label: "Actions", render: (c) => (
              <div className="flex flex-wrap items-center gap-1.5">
                <RowActions
                  onView={() => setSelected(c.id)}
                  onEdit={() => setEditing(toInput(c))}
                  onDelete={user?.isAdmin ? () => setToDelete(c) : undefined}
                />
                <button
                  className={btnGhost}
                  onClick={() => mArchive.mutate({ id: c.id, archived: c.status !== "archived" })}
                >
                  {c.status === "archived" ? "Restore" : "Archive"}
                </button>
              </div>
            ) },
          ]}
        />
      </AdminPanel>

      {selected && detail.data && (
        <AdminPanel
          title={`${detail.data.client.full_name} — profile`}
          action={
            <div className="flex gap-2">
              <button className={btnGhost} onClick={() => setEditing(toInput(detail.data!.client as Client))}>Edit</button>
              {user?.isAdmin && (
                <button className={btnGhost} onClick={() => setToDelete(detail.data!.client as Client)}>Delete</button>
              )}
              <button className={btnGhost} onClick={() => setSelected(null)}>Close</button>
            </div>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Client number" value={detail.data.client.client_number || "—"} />
            <Info label="Email" value={detail.data.client.email} />
            <Info label="Phone" value={detail.data.client.phone || "—"} />
            <Info label="WhatsApp" value={detail.data.client.whatsapp || "—"} />
            <Info label="Company" value={detail.data.client.company_name || "—"} />
            <Info label="Reg number" value={detail.data.client.registration_number || "—"} />
            <Info label="VAT number" value={detail.data.client.vat_number || "—"} />
            <Info label="Address" value={detail.data.client.address || "—"} />
            <Info label="Industry" value={detail.data.client.industry || "—"} />
            <Info label="Status" value={detail.data.client.status} />
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

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this client?"
        message={`Are you sure you want to delete ${toDelete?.full_name ?? "this client"}? This action cannot be undone. Archive instead if you only want it out of the active list.`}
        pending={mDelete.isPending}
        error={mDelete.error instanceof Error ? mDelete.error.message : null}
        onCancel={() => { mDelete.reset(); setToDelete(null); }}
        onConfirm={() => toDelete && mDelete.mutate(toDelete.id)}
      >
        {rel.data && (
          <div className="mt-3 rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
            Linked records: {rel.data.projects} projects · {rel.data.invoices} invoices · {rel.data.payments} payments ·{" "}
            {rel.data.documents} documents · {rel.data.websites} websites · {rel.data.tickets} tickets.
            {(rel.data.invoices > 0 || rel.data.payments > 0) && (
              <div className="mt-1 text-red-400">Invoices or payments exist — this client can only be archived.</div>
            )}
          </div>
        )}
        {toDelete && (
          <button
            className={`${btnGhost} mt-3`}
            onClick={() => { mArchive.mutate({ id: toDelete.id, archived: true }); setToDelete(null); }}
          >
            Archive instead
          </button>
        )}
      </ConfirmDialog>
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

function ClientForm({ value, onSubmit, onCancel, onOpenExisting, pending }: {
  value: ClientInput;
  onSubmit: (v: ClientInput) => void;
  onCancel: () => void;
  onOpenExisting: (id: string) => void;
  pending: boolean;
}) {
  const checkDuplicates = useServerFn(findClientDuplicates);
  const [f, setF] = useState<ClientInput>(value);
  const [dupes, setDupes] = useState<Awaited<ReturnType<typeof findClientDuplicates>> | null>(null);
  const isEdit = !!f.id;

  const mCheck = useMutation({
    mutationFn: () => checkDuplicates({ data: { company_name: f.company_name || undefined, email: f.email || undefined, phone: f.phone || undefined, full_name: f.full_name || undefined } }),
    onSuccess: (rows) => { if (rows.length === 0) onSubmit(f); else setDupes(rows); },
  });

  return (
    <form
      className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (isEdit) onSubmit(f);
        else mCheck.mutate();
      }}
    >
      <div className="sm:col-span-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        {isEdit ? "Edit client record" : "New client"}
      </div>
      <input required className={inputCls} placeholder="Full name / contact person" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
      <input required type="email" className={inputCls} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={inputCls} placeholder="Phone" value={f.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <input className={inputCls} placeholder="WhatsApp" value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} />
      <input className={inputCls} placeholder="Company name" value={f.company_name ?? ""} onChange={(e) => setF({ ...f, company_name: e.target.value })} />
      <input className={inputCls} placeholder="Registration number" value={f.registration_number ?? ""} onChange={(e) => setF({ ...f, registration_number: e.target.value })} />
      <input className={inputCls} placeholder="VAT number" value={f.vat_number ?? ""} onChange={(e) => setF({ ...f, vat_number: e.target.value })} />
      <input className={inputCls} placeholder="Industry" value={f.industry ?? ""} onChange={(e) => setF({ ...f, industry: e.target.value })} />
      <input className={inputCls} placeholder="Address / location" value={f.address ?? ""} onChange={(e) => setF({ ...f, address: e.target.value })} />
      <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ClientInput["status"] })}>
        {["active", "prospect", "dormant"].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Internal notes" value={f.notes ?? ""} onChange={(e) => setF({ ...f, notes: e.target.value })} />

      {dupes && dupes.length > 0 && (
        <div className="sm:col-span-3 rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-3">
          <div className="text-sm font-semibold text-[var(--color-gold)]">Possible existing client found.</div>
          <ul className="mt-2 grid gap-1.5">
            {dupes.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span>{d.client_number ? `${d.client_number} · ` : ""}{d.company_name || d.full_name} · {d.email}</span>
                <button type="button" className={btnGhost} onClick={() => onOpenExisting(d.id)}>Open existing client</button>
              </li>
            ))}
          </ul>
          <button type="button" className={`${btnCls} mt-3`} onClick={() => onSubmit(f)}>Continue creating a new client</button>
        </div>
      )}

      <div className="sm:col-span-3 flex gap-2">
        <button className={btnCls} disabled={pending || mCheck.isPending}>{isEdit ? "Save changes" : "Save client"}</button>
        <button type="button" className={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
