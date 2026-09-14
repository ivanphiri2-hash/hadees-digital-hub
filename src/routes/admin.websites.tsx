import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Plus, ExternalLink } from "lucide-react";
import { AdminShell, AdminPanel, StatusPill, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnCls, btnGhost, downloadCsv, inputCls } from "@/components/admin/table";
import { deleteWebsite, listWebsites, upsertWebsite, WEBSITE_STATUSES } from "@/lib/crm.functions";

export const Route = createFileRoute("/admin/websites")({
  head: () => ({
    meta: [
      { title: "Website & Technical Tracker — Hadees Trading" },
      { name: "description", content: "Every client website: status, domain, hosting, deployment and build platform records." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WebsitesPage,
});

const BLANK = {
  client_id: "", name: "", status: "not_started" as (typeof WEBSITE_STATUSES)[number],
  live_url: "", demo_url: "", domain: "", domain_registrar: "", hosting_provider: "",
  deployment_provider: "", lovable_project_name: "", lovable_project_url: "", lovable_account_email: "",
  github_repo: "", github_account: "", vercel_project: "", netlify_project: "", supabase_ref: "",
  database_notes: "", dns_notes: "", deployment_notes: "", technical_notes: "",
};

function WebsitesPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listWebsites);
  const save = useServerFn(upsertWebsite);
  const remove = useServerFn(deleteWebsite);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<(typeof BLANK & { id?: string }) | null>(null);

  const q = useQuery({ queryKey: ["admin", "websites"], queryFn: () => fetchAll({}) });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "websites"] });

  const mSave = useMutation({
    mutationFn: (v: typeof BLANK & { id?: string }) =>
      save({ data: { ...v, client_id: v.client_id || null } as never }),
    onSuccess: () => { setEditing(null); invalidate(); },
  });
  const mDelete = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: invalidate });

  const clientName = (id: string | null) => {
    const c = (q.data?.clients ?? []).find((x) => x.id === id);
    return c ? (c.company_name || c.full_name) : "—";
  };

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (q.data?.websites ?? []).filter((w) => {
      if (statusFilter && w.status !== statusFilter) return false;
      if (!term) return true;
      return [w.name, w.domain, w.live_url, w.demo_url, w.github_repo, w.lovable_project_name, clientName(w.client_id)]
        .some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [q.data, search, statusFilter]);

  return (
    <AdminShell title="Websites & Technical" subtitle="Where every client website lives: domain, hosting, deployment and build platform.">
      <AdminPanel
        title={`Website records (${rows.length})`}
        action={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => downloadCsv("hadees-websites.csv", rows as unknown as Record<string, unknown>[])}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button className={btnCls} onClick={() => setEditing({ ...BLANK })}><Plus className="h-3.5 w-3.5" /> New website</button>
          </div>
        }
      >
        {editing && (
          <WebsiteForm
            value={editing}
            clients={q.data?.clients ?? []}
            pending={mSave.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => mSave.mutate(v)}
          />
        )}

        <Toolbar>
          <input className={inputCls} placeholder="Search name, domain, repo, client…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {WEBSITE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No website records yet — add one for each client build."
          cols={[
            { key: "name", label: "Website", render: (w) => (
              <button className="text-left" onClick={() => setEditing({ ...BLANK, ...Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v ?? ""])) } as never)}>
                <div className="font-medium">{w.name}</div>
                <div className="text-[11px] text-muted-foreground">{clientName(w.client_id)}</div>
              </button>
            ) },
            { key: "status", label: "Status", render: (w) => <StatusPill status={w.status} /> },
            { key: "links", label: "Links", render: (w) => (
              <div className="grid gap-0.5 text-[11px]">
                {w.live_url && <a className="inline-flex items-center gap-1 text-[var(--color-royal-soft)]" href={w.live_url} target="_blank" rel="noreferrer">Live <ExternalLink className="h-3 w-3" /></a>}
                {w.demo_url && <a className="inline-flex items-center gap-1 text-muted-foreground" href={w.demo_url} target="_blank" rel="noreferrer">Demo <ExternalLink className="h-3 w-3" /></a>}
                {!w.live_url && !w.demo_url && <span className="text-muted-foreground">—</span>}
              </div>
            ) },
            { key: "infra", label: "Domain / Hosting", render: (w) => (
              <div className="text-[11px] text-muted-foreground"><div>{w.domain || "—"}</div><div>{w.hosting_provider || w.deployment_provider || "—"}</div></div>
            ) },
            { key: "build", label: "Built on", render: (w) => (
              <div className="text-[11px] text-muted-foreground"><div>{w.lovable_project_name || "—"}</div><div>{w.github_repo || "—"}</div></div>
            ) },
            { key: "updated", label: "Updated", render: (w) => <span className="text-xs">{shortDate(w.updated_at)}</span> },
            { key: "actions", label: "", render: (w) => (
              <button className={btnGhost} onClick={() => { if (confirm("Delete this website record?")) mDelete.mutate(w.id); }}>Delete</button>
            ) },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}

function WebsiteForm({
  value, clients, pending, onSubmit, onCancel,
}: {
  value: typeof BLANK & { id?: string };
  clients: { id: string; full_name: string; company_name: string | null }[];
  pending: boolean;
  onSubmit: (v: typeof BLANK & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(value);
  const set = (k: keyof typeof BLANK) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <form className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-4 sm:grid-cols-3"
      onSubmit={(e) => { e.preventDefault(); onSubmit(f); }}>
      <input required className={inputCls} placeholder="Website / project name" value={f.name} onChange={set("name")} />
      <select className={inputCls} value={f.client_id} onChange={set("client_id")}>
        <option value="">No client linked</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.full_name}</option>)}
      </select>
      <select className={inputCls} value={f.status} onChange={set("status")}>
        {WEBSITE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>

      <input className={inputCls} placeholder="Live URL" value={f.live_url} onChange={set("live_url")} />
      <input className={inputCls} placeholder="Demo URL" value={f.demo_url} onChange={set("demo_url")} />
      <input className={inputCls} placeholder="Domain" value={f.domain} onChange={set("domain")} />

      <input className={inputCls} placeholder="Domain registrar" value={f.domain_registrar} onChange={set("domain_registrar")} />
      <input className={inputCls} placeholder="Hosting provider" value={f.hosting_provider} onChange={set("hosting_provider")} />
      <input className={inputCls} placeholder="Deployment provider" value={f.deployment_provider} onChange={set("deployment_provider")} />

      <input className={inputCls} placeholder="Lovable project name" value={f.lovable_project_name} onChange={set("lovable_project_name")} />
      <input className={inputCls} placeholder="Lovable project URL" value={f.lovable_project_url} onChange={set("lovable_project_url")} />
      <input className={inputCls} placeholder="Lovable account email" value={f.lovable_account_email} onChange={set("lovable_account_email")} />

      <input className={inputCls} placeholder="GitHub repository" value={f.github_repo} onChange={set("github_repo")} />
      <input className={inputCls} placeholder="GitHub account" value={f.github_account} onChange={set("github_account")} />
      <input className={inputCls} placeholder="Vercel project" value={f.vercel_project} onChange={set("vercel_project")} />

      <input className={inputCls} placeholder="Netlify project" value={f.netlify_project} onChange={set("netlify_project")} />
      <input className={inputCls} placeholder="Supabase reference" value={f.supabase_ref} onChange={set("supabase_ref")} />
      <input className={inputCls} placeholder="DNS notes" value={f.dns_notes} onChange={set("dns_notes")} />

      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Deployment notes" value={f.deployment_notes} onChange={set("deployment_notes")} />
      <textarea className={`${inputCls} sm:col-span-3`} rows={2} placeholder="Technical notes (never store passwords or secret keys here)" value={f.technical_notes} onChange={set("technical_notes")} />

      <div className="flex gap-2 sm:col-span-3">
        <button className={btnCls} disabled={pending}>{f.id ? "Update website" : "Save website"}</button>
        <button type="button" className={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
      <p className="text-[11px] text-muted-foreground sm:col-span-3">
        Never store passwords, API keys or PayFast secrets in these fields.
      </p>
    </form>
  );
}
