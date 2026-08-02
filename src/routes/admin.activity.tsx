import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AdminShell, AdminPanel } from "@/components/admin/shell";
import { DataTable, Toolbar, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { listActivity, listEnquiries } from "@/lib/platform.functions";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log — Hadees Trading Control Centre" },
      { name: "description", content: "Timestamped audit trail of every action taken across the Hadees Trading platform." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const fetchActivity = useServerFn(listActivity);
  const fetchEnquiries = useServerFn(listEnquiries);
  const [search, setSearch] = useState("");

  const activity = useQuery({ queryKey: ["admin", "activity"], queryFn: () => fetchActivity({}) });
  const enquiries = useQuery({ queryKey: ["admin", "enquiries"], queryFn: () => fetchEnquiries({}) });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activity.data ?? [];
    return (activity.data ?? []).filter((a) => [a.action, a.entity_type, a.actor_name].some((v) => (v ?? "").toLowerCase().includes(term)));
  }, [activity.data, search]);

  const when = (v: string) => new Date(v).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });

  return (
    <AdminShell title="Activity" subtitle="Full audit trail — who did what, and when.">
      <AdminPanel
        title={`Audit log (${rows.length})`}
        action={<button className={btnGhost} onClick={() => downloadCsv("hadees-activity.csv", rows as unknown as Record<string, unknown>[])}>Export CSV</button>}
      >
        <Toolbar>
          <input className={inputCls} placeholder="Search action, entity, actor…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Toolbar>
        <DataTable
          rows={rows}
          empty="No activity recorded yet."
          cols={[
            { key: "d", label: "When", render: (a) => <span className="text-xs">{when(a.created_at)}</span> },
            { key: "u", label: "User", render: (a) => <span className="text-xs">{a.actor_name || a.actor_id?.slice(0, 8) || "system"}</span> },
            { key: "a", label: "Action", render: (a) => <span className="font-medium">{a.action}</span> },
            { key: "e", label: "Entity", render: (a) => <span className="font-mono text-[11px]">{a.entity_type ?? "—"}</span> },
          ]}
        />
      </AdminPanel>

      <AdminPanel title={`Website enquiries (${enquiries.data?.length ?? 0})`}>
        <DataTable
          rows={enquiries.data ?? []}
          empty="No website enquiries yet."
          cols={[
            { key: "d", label: "When", render: (e) => <span className="text-xs">{when(e.created_at)}</span> },
            { key: "n", label: "Name", render: (e) => <div><div className="font-medium">{e.name}</div><div className="text-[11px] text-muted-foreground">{e.email}</div></div> },
            { key: "s", label: "Service", render: (e) => <span className="text-xs">{e.service || "—"}</span> },
            { key: "m", label: "Message", render: (e) => <span className="text-xs text-muted-foreground">{e.message.slice(0, 120)}</span> },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}
