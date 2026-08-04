import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCalendar } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, shortDate } from "@/components/admin/shell";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Hadees Trading Control Centre" },
      { name: "description", content: "Follow-ups, invoice due dates, project deliveries and task deadlines in one business calendar." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CalendarPage,
});

const KIND_LABEL: Record<string, string> = {
  follow_up: "Follow-up",
  invoice_due: "Payment due",
  project_due: "Project delivery",
  task_due: "Task deadline",
};

const KIND_TONE: Record<string, string> = {
  follow_up: "bg-amber-500/15 text-amber-300",
  invoice_due: "bg-red-500/15 text-red-300",
  project_due: "bg-emerald-500/15 text-emerald-300",
  task_due: "bg-white/5 text-muted-foreground",
};

function CalendarPage() {
  const fetchCalendar = useServerFn(getCalendar);
  const q = useQuery({ queryKey: ["admin", "calendar"], queryFn: () => fetchCalendar({}) });
  const [kind, setKind] = useState("all");

  const events = useMemo(() => (q.data ?? []).filter((e) => kind === "all" || e.kind === kind), [q.data, kind]);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = events.filter((e) => e.date < today);
  const upcoming = events.filter((e) => e.date >= today);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of upcoming) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return [...map.entries()];
  }, [upcoming]);

  return (
    <AdminShell title="Calendar" subtitle="Consultations, follow-ups, payment due dates and delivery deadlines.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Scheduled items" value={String(q.data?.length ?? 0)} />
        <KpiCard label="Overdue" value={String(overdue.length)} tone="red" />
        <KpiCard label="Upcoming" value={String(upcoming.length)} tone="gold" />
        <KpiCard label="Next 7 days" value={String(upcoming.filter((e) => e.date <= new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)).length)} tone="green" />
      </div>

      <AdminPanel
        title="Business calendar"
        action={
          <select className="rounded-xl border border-border bg-background px-3 py-2 text-xs" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All events</option>
            {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        }
      >
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading calendar…</p>}

        {overdue.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-2 text-[10px] uppercase tracking-widest text-red-300">Overdue</h3>
            <ul className="grid gap-2">
              {overdue.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm">
                  <div><div className="font-medium">{e.title}</div><div className="text-[11px] text-muted-foreground">{e.meta}</div></div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">{shortDate(e.date)}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${KIND_TONE[e.kind]}`}>{KIND_LABEL[e.kind]}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4">
          {grouped.map(([date, list]) => (
            <div key={date}>
              <h3 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">{shortDate(date)}</h3>
              <ul className="grid gap-2">
                {list.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm">
                    <div><div className="font-medium">{e.title}</div><div className="text-[11px] text-muted-foreground">{e.meta}</div></div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${KIND_TONE[e.kind]}`}>{KIND_LABEL[e.kind]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!q.isLoading && grouped.length === 0 && overdue.length === 0 && (
            <p className="text-xs text-muted-foreground">Nothing scheduled. Add follow-up dates on leads or due dates on projects and invoices.</p>
          )}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
