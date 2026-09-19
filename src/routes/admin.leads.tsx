import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Plus, UserPlus } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { ConfirmDialog, ErrorBar, RowActions } from "@/components/admin/actions";
import { LEAD_STAGES, LEAD_SOURCES, convertLeadToClient, createLead, listLeads, patchLead } from "@/lib/platform.functions";
import { deleteLead } from "@/lib/crm-admin.functions";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Hadees Trading Control Centre" },
      { name: "description", content: "Track, qualify and convert every enquiry captured by the Hadees Trading website and CRM." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadsPage,
});

type Lead = Awaited<ReturnType<typeof listLeads>>[number];

interface LeadPatch {
  id: string;
  name?: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  service_name?: string | null;
  source?: (typeof LEAD_SOURCES)[number];
  stage?: (typeof LEAD_STAGES)[number];
  notes?: string;
  next_follow_up?: string | null;
  value_cents?: number;
}

interface NewLead {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  service_name?: string;
  value_cents: number;
  notes?: string;
  source: "manual";
}

function LeadsPage() {
  const qc = useQueryClient();
  const fetchLeads = useServerFn(listLeads);
  const patch = useServerFn(patchLead);
  const create = useServerFn(createLead);
  const convert = useServerFn(convertLeadToClient);
  const remove = useServerFn(deleteLead);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Lead | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [toDelete, setToDelete] = useState<Lead | null>(null);

  const q = useQuery({ queryKey: ["admin", "leads"], queryFn: () => fetchLeads({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "leads"] });

  const mPatch = useMutation({ mutationFn: (v: LeadPatch) => patch({ data: v }), onSuccess: invalidate });
  const mCreate = useMutation({ mutationFn: (v: NewLead) => create({ data: v }), onSuccess: () => { setOpen(false); invalidate(); } });
  const mConvert = useMutation({ mutationFn: (id: string) => convert({ data: { id } }), onSuccess: invalidate });
  const mDelete = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { setToDelete(null); setActive(null); invalidate(); },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (q.data ?? []).filter((l) => {
      if (stage !== "all" && l.stage !== stage) return false;
      if (!term) return true;
      return [l.name, l.company, l.email, l.phone, l.service_name].some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [q.data, search, stage]);

  return (
    <AdminShell title="Leads" subtitle="Every enquiry from the website, WhatsApp, referrals and manual capture.">
      <AdminPanel
        title={`Pipeline (${rows.length})`}
        action={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => downloadCsv("hadees-leads.csv", rows as unknown as Record<string, unknown>[])}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button className={btnCls} onClick={() => setOpen((v) => !v)}><Plus className="h-3.5 w-3.5" /> New lead</button>
          </div>
        }
      >
        {open && <NewLeadForm onSubmit={(v) => mCreate.mutate(v)} pending={mCreate.isPending} />}
        <ErrorBar error={mPatch.error ?? mCreate.error ?? mConvert.error} />

        <Toolbar>
          <input className={inputCls} placeholder="Search name, company, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputCls} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="all">All stages</option>
            {LEAD_STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No leads match this filter."
          cols={[
            { key: "name", label: "Lead", render: (l) => (
              <button className="text-left" onClick={() => { setViewOnly(true); setActive(l); }}>
                <div className="font-medium">{l.name}</div>
                <div className="text-[11px] text-muted-foreground">{l.company || "—"}</div>
              </button>
            ) },
            { key: "contact", label: "Contact", render: (l) => (
              <div className="text-[11px] text-muted-foreground">
                <div>{l.email || "—"}</div><div>{l.phone || "—"}</div>
              </div>
            ) },
            { key: "service", label: "Service", render: (l) => <span className="text-xs">{l.service_name || "—"}</span> },
            { key: "source", label: "Source", render: (l) => <span className="text-xs capitalize">{l.source}</span> },
            { key: "value", label: "Budget", render: (l) => money(l.value_cents) },
            { key: "follow", label: "Follow-up", render: (l) => <span className="text-xs">{shortDate(l.next_follow_up)}</span> },
            { key: "stage", label: "Stage", render: (l) => (
              <select
                className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]"
                value={l.stage}
                onChange={(e) => mPatch.mutate({ id: l.id, stage: e.target.value as typeof LEAD_STAGES[number] })}
              >
                {LEAD_STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            ) },
            { key: "convert", label: "", render: (l) => l.client_id
              ? <StatusPill status="client" />
              : <button className={btnGhost} disabled={mConvert.isPending} onClick={() => mConvert.mutate(l.id)}><UserPlus className="h-3.5 w-3.5" /> Convert</button> },
            { key: "actions", label: "Actions", render: (l) => (
              <RowActions
                onView={() => { setViewOnly(true); setActive(l); }}
                onEdit={() => { setViewOnly(false); setActive(l); }}
                onDelete={() => setToDelete(l)}
              />
            ) },
          ]}
        />
      </AdminPanel>

      {active && (
        <LeadDrawer
          lead={active}
          readOnly={viewOnly}
          onEdit={() => setViewOnly(false)}
          onClose={() => setActive(null)}
          onDelete={() => setToDelete(active)}
          onSave={(v) => { mPatch.mutate(v); setActive(null); }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this lead?"
        message={`Are you sure you want to delete the lead "${toDelete?.name ?? ""}"? This action cannot be undone.`}
        pending={mDelete.isPending}
        error={mDelete.error instanceof Error ? mDelete.error.message : null}
        onCancel={() => { mDelete.reset(); setToDelete(null); }}
        onConfirm={() => toDelete && mDelete.mutate(toDelete.id)}
      />
    </AdminShell>
  );
}

function NewLeadForm({ onSubmit, pending }: { onSubmit: (v: NewLead) => void; pending: boolean }) {
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", service_name: "", value: "", notes: "" });
  return (
    <form
      className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: f.name, company: f.company || undefined, email: f.email || undefined, phone: f.phone || undefined,
          service_name: f.service_name || undefined, notes: f.notes || undefined,
          value_cents: Math.round((Number(f.value) || 0) * 100), source: "manual",
        });
      }}
    >
      <input required className={inputCls} placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={inputCls} placeholder="Company" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
      <input className={inputCls} type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={inputCls} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <input className={inputCls} placeholder="Interested service" value={f.service_name} onChange={(e) => setF({ ...f, service_name: e.target.value })} />
      <input className={inputCls} type="number" min="0" placeholder="Budget (ZAR)" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Internal notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <button className={btnCls} disabled={pending}>Save lead</button>
    </form>
  );
}

function LeadDrawer({ lead, readOnly, onClose, onEdit, onDelete, onSave }: {
  lead: Lead;
  readOnly: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (v: LeadPatch) => void;
}) {
  const [f, setF] = useState({
    name: lead.name ?? "",
    company: lead.company ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    service_name: lead.service_name ?? "",
    source: (lead.source ?? "manual") as (typeof LEAD_SOURCES)[number],
    stage: lead.stage,
    notes: lead.notes ?? "",
    followUp: lead.next_follow_up ?? "",
    value: String((lead.value_cents ?? 0) / 100),
  });

  return (
    <AdminPanel
      title={`${lead.name} — ${readOnly ? "lead record" : "edit lead"}`}
      action={
        <div className="flex gap-2">
          {readOnly && <button className={btnGhost} onClick={onEdit}>Edit</button>}
          <button className={btnGhost} onClick={onDelete}>Delete</button>
          <button className={btnGhost} onClick={onClose}>Close</button>
        </div>
      }
    >
      {readOnly ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Company" value={lead.company || "—"} />
          <Field label="Email" value={lead.email || "—"} />
          <Field label="Phone" value={lead.phone || "—"} />
          <Field label="Service" value={lead.service_name || "—"} />
          <Field label="Source" value={lead.source} />
          <Field label="Stage" value={lead.stage.replace(/_/g, " ")} />
          <Field label="Budget" value={money(lead.value_cents)} />
          <Field label="Follow-up" value={shortDate(lead.next_follow_up)} />
          <Field label="Created" value={shortDate(lead.created_at)} />
          <div className="sm:col-span-3 rounded-xl border border-border/60 p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{lead.notes || "—"}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Labelled label="Full name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Labelled>
            <Labelled label="Company"><input className={inputCls} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Labelled>
            <Labelled label="Email"><input className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Labelled>
            <Labelled label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Labelled>
            <Labelled label="Service"><input className={inputCls} value={f.service_name} onChange={(e) => setF({ ...f, service_name: e.target.value })} /></Labelled>
            <Labelled label="Source">
              <select className={inputCls} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as typeof f.source })}>
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Labelled>
            <Labelled label="Stage">
              <select className={inputCls} value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value as typeof f.stage })}>
                {LEAD_STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </Labelled>
            <Labelled label="Follow-up date"><input type="date" className={inputCls} value={f.followUp} onChange={(e) => setF({ ...f, followUp: e.target.value })} /></Labelled>
            <Labelled label="Budget (ZAR)"><input type="number" min="0" className={inputCls} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></Labelled>
          </div>
          <label className="mt-3 grid gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Communication history / notes</span>
            <textarea rows={5} className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </label>
          <button
            className={`${btnCls} mt-3`}
            onClick={() => onSave({
              id: lead.id,
              name: f.name,
              company: f.company || null,
              email: f.email || null,
              phone: f.phone || null,
              service_name: f.service_name || null,
              source: f.source,
              stage: f.stage,
              notes: f.notes,
              next_follow_up: f.followUp || null,
              value_cents: Math.round((Number(f.value) || 0) * 100),
            })}
          >
            Save changes
          </button>
        </>
      )}
    </AdminPanel>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}
