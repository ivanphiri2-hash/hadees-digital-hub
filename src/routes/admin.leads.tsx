import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Plus, UserPlus } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { LEAD_STAGES, convertLeadToClient, createLead, listLeads, patchLead } from "@/lib/platform.functions";

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

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Lead | null>(null);

  const q = useQuery({ queryKey: ["admin", "leads"], queryFn: () => fetchLeads({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "leads"] });

  const mPatch = useMutation({ mutationFn: (v: LeadPatch) => patch({ data: v }), onSuccess: invalidate });
  const mCreate = useMutation({ mutationFn: (v: NewLead) => create({ data: v }), onSuccess: () => { setOpen(false); invalidate(); } });
  const mConvert = useMutation({ mutationFn: (id: string) => convert({ data: { id } }), onSuccess: invalidate });

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
              <button className="text-left" onClick={() => setActive(l)}>
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
            { key: "actions", label: "", render: (l) => l.client_id
              ? <StatusPill status="client" />
              : <button className={btnGhost} disabled={mConvert.isPending} onClick={() => mConvert.mutate(l.id)}><UserPlus className="h-3.5 w-3.5" /> Convert</button> },
          ]}
        />
      </AdminPanel>

      {active && <LeadDrawer lead={active} onClose={() => setActive(null)} onSave={(v) => { mPatch.mutate(v); setActive(null); }} />}
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

function LeadDrawer({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (v: { id: string; notes: string; next_follow_up: string | null; value_cents: number }) => void }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followUp, setFollowUp] = useState(lead.next_follow_up ?? "");
  const [value, setValue] = useState(String((lead.value_cents ?? 0) / 100));
  return (
    <AdminPanel title={`${lead.name} — lead detail`} action={<button className={btnGhost} onClick={onClose}>Close</button>}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Company" value={lead.company || "—"} />
        <Field label="Email" value={lead.email || "—"} />
        <Field label="Phone" value={lead.phone || "—"} />
        <Field label="Source" value={lead.source} />
        <Field label="Stage" value={lead.stage.replace(/_/g, " ")} />
        <Field label="Created" value={shortDate(lead.created_at)} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Follow-up date</span>
          <input type="date" className={inputCls} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Budget (ZAR)</span>
          <input type="number" min="0" className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
      </div>
      <label className="mt-3 grid gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Communication history / notes</span>
        <textarea rows={5} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button
        className={`${btnCls} mt-3`}
        onClick={() => onSave({ id: lead.id, notes, next_follow_up: followUp || null, value_cents: Math.round((Number(value) || 0) * 100) })}
      >
        Save changes
      </button>
    </AdminPanel>
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
