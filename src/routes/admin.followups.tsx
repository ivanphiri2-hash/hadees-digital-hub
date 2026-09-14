import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { AdminShell, AdminPanel, KpiCard, StatusPill, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { deleteFollowUp, FOLLOW_UP_STATUSES, listFollowUps, upsertFollowUp } from "@/lib/crm.functions";

export const Route = createFileRoute("/admin/followups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — Hadees Trading Control Centre" },
      { name: "description", content: "Scheduled follow-ups for leads and clients: today, overdue and upcoming." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FollowUpsPage,
});

const today = () => new Date().toISOString().slice(0, 10);

function FollowUpsPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listFollowUps);
  const save = useServerFn(upsertFollowUp);
  const remove = useServerFn(deleteFollowUp);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const q = useQuery({ queryKey: ["admin", "followups"], queryFn: () => fetchAll({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "followups"] });

  const mSave = useMutation({
    mutationFn: (v: Record<string, unknown>) => save({ data: v as never }),
    onSuccess: () => { setOpen(false); invalidate(); },
  });
  const mDelete = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: invalidate });

  const all = q.data?.followUps ?? [];
  const t = today();
  const openItems = all.filter((f) => f.status === "open");
  const dueToday = openItems.filter((f) => f.due_date === t);
  const overdue = openItems.filter((f) => f.due_date < t);
  const upcoming = openItems.filter((f) => f.due_date > t);

  const subject = (f: { lead_id: string | null; client_id: string | null }) => {
    const lead = (q.data?.leads ?? []).find((l) => l.id === f.lead_id);
    if (lead) return `${lead.name}${lead.company ? ` · ${lead.company}` : ""}`;
    const c = (q.data?.clients ?? []).find((x) => x.id === f.client_id);
    return c ? (c.company_name || c.full_name) : "—";
  };

  const rows = useMemo(() => {
    if (filter === "today") return dueToday;
    if (filter === "overdue") return overdue;
    if (filter === "upcoming") return upcoming;
    if (filter === "done") return all.filter((f) => f.status !== "open");
    return all;
  }, [all, filter, dueToday, overdue, upcoming]);

  return (
    <AdminShell title="Follow-ups" subtitle="Never lose a lead — every call-back, meeting and reminder in one queue.">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Due today" value={String(dueToday.length)} tone="gold" />
        <KpiCard label="Overdue" value={String(overdue.length)} tone="red" />
        <KpiCard label="Upcoming" value={String(upcoming.length)} />
      </div>

      <AdminPanel
        title={`Follow-up queue (${rows.length})`}
        action={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => downloadCsv("hadees-followups.csv", rows as unknown as Record<string, unknown>[])}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button className={btnCls} onClick={() => setOpen((v) => !v)}><Plus className="h-3.5 w-3.5" /> New follow-up</button>
          </div>
        }
      >
        {open && (
          <FollowUpForm
            leads={q.data?.leads ?? []}
            clients={q.data?.clients ?? []}
            pending={mSave.isPending}
            onSubmit={(v) => mSave.mutate(v)}
          />
        )}

        <Toolbar>
          <select className={inputCls} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="today">Due today</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
            <option value="done">Closed</option>
          </select>
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No follow-ups scheduled."
          cols={[
            { key: "who", label: "Lead / client", render: (f) => <span className="text-sm font-medium">{subject(f)}</span> },
            { key: "reason", label: "Reason", render: (f) => <div><div className="text-sm">{f.reason}</div><div className="text-[11px] text-muted-foreground">{f.notes || ""}</div></div> },
            { key: "due", label: "Due", render: (f) => <span className="text-xs">{shortDate(f.due_date)}{f.due_time ? ` · ${String(f.due_time).slice(0, 5)}` : ""}</span> },
            { key: "status", label: "Status", render: (f) => (
              <div className="flex items-center gap-2">
                <StatusPill status={f.status} />
                {f.status === "open" && (
                  <button className={btnGhost} onClick={() => mSave.mutate({ id: f.id, due_date: f.due_date, reason: f.reason, status: "done" })}>Done</button>
                )}
              </div>
            ) },
            { key: "actions", label: "", render: (f) => (
              <button className={btnGhost} onClick={() => { if (confirm("Delete this follow-up?")) mDelete.mutate(f.id); }}>Delete</button>
            ) },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}

function FollowUpForm({
  leads, clients, pending, onSubmit,
}: {
  leads: { id: string; name: string; company: string | null }[];
  clients: { id: string; full_name: string; company_name: string | null }[];
  pending: boolean;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [f, setF] = useState({ lead_id: "", client_id: "", due_date: today(), due_time: "", reason: "", notes: "" });
  return (
    <form className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          lead_id: f.lead_id || null,
          client_id: f.client_id || null,
          due_date: f.due_date,
          due_time: f.due_time || null,
          reason: f.reason,
          notes: f.notes || null,
          status: "open",
        });
      }}>
      <select className={inputCls} value={f.lead_id} onChange={(e) => setF({ ...f, lead_id: e.target.value, client_id: "" })}>
        <option value="">Link a lead…</option>
        {leads.map((l) => <option key={l.id} value={l.id}>{l.name}{l.company ? ` · ${l.company}` : ""}</option>)}
      </select>
      <select className={inputCls} value={f.client_id} onChange={(e) => setF({ ...f, client_id: e.target.value, lead_id: "" })}>
        <option value="">…or a client</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.full_name}</option>)}
      </select>
      <input required className={inputCls} placeholder="Reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
      <input required type="date" className={inputCls} value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} />
      <input type="time" className={inputCls} value={f.due_time} onChange={(e) => setF({ ...f, due_time: e.target.value })} />
      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <button className={btnCls} disabled={pending}>Schedule follow-up</button>
    </form>
  );
}
