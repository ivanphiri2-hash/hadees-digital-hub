import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminPanel, StatusPill, shortDate } from "@/components/admin/shell";
import { DataTable, btnCls, inputCls } from "@/components/admin/table";
import { listTickets, setTicketStatus, upsertTicket } from "@/lib/platform.functions";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support — Hadees Trading Control Centre" },
      { name: "description", content: "Client support tickets with priority, assignment and resolution tracking." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SupportPage,
});

const STATUSES = ["open", "in_progress", "waiting_client", "resolved", "closed"] as const;

function SupportPage() {
  const qc = useQueryClient();
  const fetchTickets = useServerFn(listTickets);
  const setStatus = useServerFn(setTicketStatus);
  const create = useServerFn(upsertTicket);
  const [f, setF] = useState({ subject: "", body: "", priority: "medium" });

  const q = useQuery({ queryKey: ["admin", "tickets"], queryFn: () => fetchTickets({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "tickets"] });

  const mStatus = useMutation({ mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => setStatus({ data: v }), onSuccess: invalidate });
  const mCreate = useMutation({
    mutationFn: (v: { subject: string; body: string; priority: "low" | "medium" | "high" | "urgent"; status: "open" }) => create({ data: v }),
    onSuccess: () => { setF({ subject: "", body: "", priority: "medium" }); invalidate(); },
  });

  return (
    <AdminShell title="Support" subtitle="Every client request, prioritised and tracked to resolution.">
      <AdminPanel title={`Tickets (${q.data?.length ?? 0})`}>
        <form
          className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
          onSubmit={(e) => { e.preventDefault(); mCreate.mutate({ subject: f.subject, body: f.body, priority: f.priority as "medium", status: "open" }); }}
        >
          <input required className={inputCls} placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          <select className={inputCls} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
            {["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className={btnCls} disabled={mCreate.isPending}>Log ticket</button>
          <textarea required className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Describe the issue" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        </form>

        <DataTable
          rows={q.data ?? []}
          empty="No support tickets."
          cols={[
            { key: "s", label: "Ticket", render: (t) => <div><div className="font-medium">{t.subject}</div><div className="text-[11px] text-muted-foreground">{t.body.slice(0, 90)}</div></div> },
            { key: "c", label: "Client", render: (t) => <span className="text-xs">{t.clients?.company_name || t.clients?.full_name || "—"}</span> },
            { key: "p", label: "Priority", render: (t) => <StatusPill status={t.priority} /> },
            { key: "d", label: "Opened", render: (t) => <span className="text-xs">{shortDate(t.created_at)}</span> },
            { key: "st", label: "Status", render: (t) => (
              <select className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]" value={t.status}
                onChange={(e) => mStatus.mutate({ id: t.id, status: e.target.value as "open" })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            ) },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}
