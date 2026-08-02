import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, inputCls } from "@/components/admin/table";
import {
  PROJECT_STATUSES, addProjectComment, deleteProjectTask, getProjectDetail,
  listClients, listProjects, upsertProject, upsertProjectTask,
} from "@/lib/platform.functions";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Hadees Trading Control Centre" },
      { name: "description", content: "Delivery pipeline with milestones, tasks, comments and progress for every Hadees Trading project." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProjectsPage,
});

interface ProjectInput {
  id?: string;
  name: string;
  client_id?: string | null;
  status: (typeof PROJECT_STATUSES)[number];
  progress: number;
  due_date?: string | null;
  description?: string;
}

function ProjectsPage() {
  const qc = useQueryClient();
  const fetchProjects = useServerFn(listProjects);
  const fetchClients = useServerFn(listClients);
  const fetchDetail = useServerFn(getProjectDetail);
  const save = useServerFn(upsertProject);
  const saveTask = useServerFn(upsertProjectTask);
  const removeTask = useServerFn(deleteProjectTask);
  const comment = useServerFn(addProjectComment);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const projects = useQuery({ queryKey: ["admin", "projects"], queryFn: () => fetchProjects({}) });
  const clients = useQuery({ queryKey: ["admin", "clients"], queryFn: () => fetchClients({}) });
  const detail = useQuery({ queryKey: ["admin", "project", selected], queryFn: () => fetchDetail({ data: { id: selected! } }), enabled: !!selected });

  const invalidate = () => { void qc.invalidateQueries({ queryKey: ["admin", "projects"] }); void qc.invalidateQueries({ queryKey: ["admin", "project"] }); };
  const mSave = useMutation({ mutationFn: (v: ProjectInput) => save({ data: v }), onSuccess: () => { setOpen(false); invalidate(); } });
  const mTask = useMutation({ mutationFn: (v: { id?: string; project_id: string; title: string; status: "todo" | "in_progress" | "done"; position: number }) => saveTask({ data: v }), onSuccess: invalidate });
  const mDelTask = useMutation({ mutationFn: (id: string) => removeTask({ data: { id } }), onSuccess: invalidate });
  const mComment = useMutation({ mutationFn: (v: { project_id: string; body: string }) => comment({ data: v }), onSuccess: invalidate });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (projects.data ?? []).filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      return !term || p.name.toLowerCase().includes(term);
    });
  }, [projects.data, status, search]);

  return (
    <AdminShell title="Projects" subtitle="Delivery board with progress, milestones, tasks and client communication.">
      <AdminPanel
        title={`Projects (${rows.length})`}
        action={<button className={btnCls} onClick={() => setOpen((v) => !v)}><Plus className="h-3.5 w-3.5" /> New project</button>}
      >
        {open && (
          <ProjectForm
            clients={(clients.data ?? []).map((c) => ({ id: c.id, label: c.company_name || c.full_name }))}
            pending={mSave.isPending}
            onSubmit={(v) => mSave.mutate(v)}
          />
        )}

        <Toolbar>
          <input className={inputCls} placeholder="Search project name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No projects yet."
          cols={[
            { key: "name", label: "Project", render: (p) => (
              <button className="text-left" onClick={() => setSelected(p.id)}>
                <div className="font-medium">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.clients?.company_name || p.clients?.full_name || "Unassigned"}</div>
              </button>
            ) },
            { key: "progress", label: "Progress", render: (p) => (
              <div className="w-32">
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-[var(--color-royal)]" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{p.progress}%</div>
              </div>
            ) },
            { key: "due", label: "Due", render: (p) => <span className="text-xs">{shortDate(p.due_date)}</span> },
            { key: "status", label: "Status", render: (p) => (
              <select className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]" value={p.status}
                onChange={(e) => mSave.mutate({ id: p.id, name: p.name, status: e.target.value as ProjectInput["status"], progress: p.progress })}>
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            ) },
          ]}
        />
      </AdminPanel>

      {selected && detail.data && (
        <AdminPanel title={`${detail.data.project.name} — delivery`} action={<button className={btnGhost} onClick={() => setSelected(null)}>Close</button>}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border/60 p-3">
              <h3 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Tasks</h3>
              <ul className="grid gap-1.5">
                {detail.data.tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-xs">
                    <span>{t.title}</span>
                    <span className="flex items-center gap-2">
                      <select className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]" value={t.status}
                        onChange={(e) => mTask.mutate({ id: t.id, project_id: detail.data!.project.id, title: t.title, status: e.target.value as "todo", position: t.position })}>
                        <option value="todo">todo</option><option value="in_progress">in progress</option><option value="done">done</option>
                      </select>
                      <button className={btnGhost} onClick={() => mDelTask.mutate(t.id)}>Remove</button>
                    </span>
                  </li>
                ))}
                {detail.data.tasks.length === 0 && <li className="text-xs text-muted-foreground">No tasks yet.</li>}
              </ul>
              <TaskAdd onAdd={(title) => mTask.mutate({ project_id: detail.data!.project.id, title, status: "todo", position: detail.data!.tasks.length })} />
            </div>

            <div className="rounded-xl border border-border/60 p-3">
              <h3 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Comments</h3>
              <ul className="grid gap-1.5">
                {detail.data.comments.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border/60 px-3 py-2 text-xs">
                    <div>{c.body}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{c.author_name || "Team"} · {shortDate(c.created_at)}</div>
                  </li>
                ))}
                {detail.data.comments.length === 0 && <li className="text-xs text-muted-foreground">No comments.</li>}
              </ul>
              <TaskAdd placeholder="Write a comment…" cta="Post" onAdd={(body) => mComment.mutate({ project_id: detail.data!.project.id, body })} />
            </div>

            <div className="rounded-xl border border-border/60 p-3 lg:col-span-2">
              <h3 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Project files</h3>
              <ul className="grid gap-1.5">
                {detail.data.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-xs">
                    <span>{d.name}</span><StatusPill status={d.category} />
                  </li>
                ))}
                {detail.data.documents.length === 0 && <li className="text-xs text-muted-foreground">No files linked.</li>}
              </ul>
            </div>
          </div>
        </AdminPanel>
      )}
    </AdminShell>
  );
}

function TaskAdd({ onAdd, placeholder = "Add a task…", cta = "Add" }: { onAdd: (v: string) => void; placeholder?: string; cta?: string }) {
  const [v, setV] = useState("");
  return (
    <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV(""); } }}>
      <input className={`${inputCls} flex-1`} placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value)} />
      <button className={btnCls}>{cta}</button>
    </form>
  );
}

function ProjectForm({ clients, onSubmit, pending }: { clients: { id: string; label: string }[]; onSubmit: (v: ProjectInput) => void; pending: boolean }) {
  const [f, setF] = useState({ name: "", client_id: "", due_date: "", progress: "0", description: "" });
  return (
    <form
      className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: f.name, client_id: f.client_id || null, status: "pending",
          progress: Number(f.progress) || 0, due_date: f.due_date || null, description: f.description || undefined,
        });
      }}
    >
      <input required className={inputCls} placeholder="Project name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <select className={inputCls} value={f.client_id} onChange={(e) => setF({ ...f, client_id: e.target.value })}>
        <option value="">No client</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <input type="date" className={inputCls} value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} />
      <input type="number" min="0" max="100" className={inputCls} placeholder="Progress %" value={f.progress} onChange={(e) => setF({ ...f, progress: e.target.value })} />
      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Scope / description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <button className={btnCls} disabled={pending}>Create project</button>
    </form>
  );
}
