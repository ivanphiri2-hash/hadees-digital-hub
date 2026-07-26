import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Users, Calendar, FileText, Receipt, Briefcase, ShieldCheck, ScrollText,
  LogOut, LayoutDashboard, ArrowUpRight, Circle,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { api } from "@/lib/api/services";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Hadees Trading" },
      { name: "description", content: "Leads, bookings, quotes, invoices, clients, roles and audit logs — Hadees Trading control centre." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminHome,
});

type TabId = "dashboard" | "leads" | "bookings" | "quotes" | "invoices" | "clients" | "roles" | "audit";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "quotes", label: "Quotes", icon: FileText },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "clients", label: "Clients", icon: Briefcase },
  { id: "roles", label: "Roles", icon: ShieldCheck },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];

function AdminHome() {
  const { user, ready, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("dashboard");

  useEffect(() => {
    if (ready && !user) navigate({ to: "/admin/login", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading admin…</div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
        <div className="glass flex h-full flex-col rounded-2xl p-4">
          <div className="mb-4 px-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Control Centre</div>
            <div className="font-display text-lg font-bold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
          <nav className="grid gap-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[var(--color-royal)]/15 text-foreground" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"}`}>
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto grid gap-2 pt-4">
            <Link to="/" className="rounded-xl border border-border/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground hover:text-foreground">View website</Link>
            <button onClick={() => { signOut(); navigate({ to: "/admin/login" }); }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <section>
        <PreviewBanner />
        {tab === "dashboard" && <Dashboard />}
        {tab === "leads" && <LeadsPanel />}
        {tab === "bookings" && <BookingsPanel />}
        {tab === "quotes" && <QuotesPanel />}
        {tab === "invoices" && <InvoicesPanel />}
        {tab === "clients" && <ClientsPanel />}
        {tab === "roles" && <RolesPanel />}
        {tab === "audit" && <AuditPanel />}
      </section>
    </div>
  );
}

function PreviewBanner() {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-4 py-3 text-xs">
      <div className="flex items-center gap-2 text-foreground">
        <Circle className="h-2 w-2 fill-[var(--color-gold)] text-[var(--color-gold)]" />
        <span><span className="font-semibold">Preview mode.</span> Wired to typed mock data via <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[10px]">src/lib/api</code>. Enable Lovable Cloud to activate real auth & database.</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const leads = useQuery({ queryKey: ["admin","leads"], queryFn: api.leads.list });
  const invoices = useQuery({ queryKey: ["admin","invoices"], queryFn: api.invoices.list });
  const quotes = useQuery({ queryKey: ["admin","quotes"], queryFn: api.quotes.list });

  const kpis = useMemo(() => {
    const l = leads.data ?? []; const i = invoices.data ?? []; const q = quotes.data ?? [];
    const pipe = q.filter(x => x.status === "sent" || x.status === "draft").reduce((s,x)=>s+x.total,0);
    const overdue = i.filter(x => x.status === "overdue").reduce((s,x)=>s+x.total,0);
    const won = l.filter(x => x.status === "won").length;
    const rate = l.length ? Math.round((won / l.length) * 100) : 0;
    return [
      { l: "Pipeline value", v: `R ${pipe.toLocaleString()}`, tone: "royal" as const },
      { l: "Open quotes", v: String(q.filter(x=>x.status!=="rejected").length), tone: "gold" as const },
      { l: "Overdue invoices", v: `R ${overdue.toLocaleString()}`, tone: "red" as const },
      { l: "Win rate (all)", v: `${rate}%`, tone: "green" as const },
    ];
  }, [leads.data, invoices.data, quotes.data]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time view of your pipeline, quotes and invoices.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="glass rounded-2xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className={`mt-1 font-display text-3xl font-bold ${
              k.tone === "royal" ? "text-[var(--color-royal-soft)]" :
              k.tone === "gold" ? "text-[var(--color-gold)]" :
              k.tone === "red" ? "text-red-400" : "text-emerald-400"}`}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent leads" href="#" onView={() => {}}>
          <ul className="divide-y divide-border/60">
            {(leads.data ?? []).slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.service} · {l.source}</div>
                </div>
                <StatusPill s={l.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent invoices">
          <ul className="divide-y divide-border/60">
            {(invoices.data ?? []).map((i) => (
              <li key={i.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{i.number}</div>
                  <div className="text-xs text-muted-foreground">{i.clientName} · due {i.dueDate}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-display text-sm font-bold">R {i.total.toLocaleString()}</div>
                  <StatusPill s={i.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, href, onView }: { title: string; children: React.ReactNode; href?: string; onView?: () => void }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">{title}</h3>
        {href && <button onClick={onView} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">View all <ArrowUpRight className="h-3 w-3" /></button>}
      </div>
      {children}
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    new: "bg-blue-500/15 text-blue-300",
    contacted: "bg-amber-500/15 text-amber-300",
    qualified: "bg-violet-500/15 text-violet-300",
    won: "bg-emerald-500/15 text-emerald-300",
    lost: "bg-red-500/15 text-red-300",
    pending: "bg-amber-500/15 text-amber-300",
    confirmed: "bg-emerald-500/15 text-emerald-300",
    completed: "bg-emerald-500/15 text-emerald-300",
    cancelled: "bg-red-500/15 text-red-300",
    draft: "bg-slate-500/15 text-slate-300",
    sent: "bg-blue-500/15 text-blue-300",
    accepted: "bg-emerald-500/15 text-emerald-300",
    rejected: "bg-red-500/15 text-red-300",
    paid: "bg-emerald-500/15 text-emerald-300",
    overdue: "bg-red-500/15 text-red-300",
    void: "bg-slate-500/15 text-slate-300",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${map[s] ?? "bg-slate-500/15 text-slate-300"}`}>{s}</span>;
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Table<T>({ rows, cols }: { rows: T[]; cols: { key: string; label: string; render: (r: T) => React.ReactNode; className?: string }[] }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-card/40 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>{cols.map(c => <th key={c.key} className={`px-4 py-3 font-medium ${c.className ?? ""}`}>{c.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-card/40">
                {cols.map(c => <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>{c.render(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadsPanel() {
  const q = useQuery({ queryKey: ["admin","leads"], queryFn: api.leads.list });
  return (
    <>
      <PanelHeader title="Leads" subtitle="Inbound enquiries from the website, WhatsApp, referrals and tenders." />
      <Table rows={q.data ?? []} cols={[
        { key: "id", label: "ID", render: r => <span className="font-mono text-xs">{r.id}</span> },
        { key: "name", label: "Name", render: r => <span className="font-medium">{r.name}</span> },
        { key: "service", label: "Service", render: r => r.service },
        { key: "source", label: "Source", render: r => r.source },
        { key: "value", label: "Value", render: r => r.value ? `R ${r.value.toLocaleString()}` : "—" },
        { key: "status", label: "Status", render: r => <StatusPill s={r.status} /> },
      ]} />
    </>
  );
}

function BookingsPanel() {
  const q = useQuery({ queryKey: ["admin","bookings"], queryFn: api.bookings.list });
  return (
    <>
      <PanelHeader title="Bookings" subtitle="Kickoffs, consults and on-site visits." />
      <Table rows={q.data ?? []} cols={[
        { key: "id", label: "ID", render: r => <span className="font-mono text-xs">{r.id}</span> },
        { key: "client", label: "Client", render: r => <span className="font-medium">{r.clientName}</span> },
        { key: "service", label: "Service", render: r => r.service },
        { key: "when", label: "When", render: r => new Date(r.when).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) },
        { key: "location", label: "Location", render: r => r.location },
        { key: "status", label: "Status", render: r => <StatusPill s={r.status} /> },
      ]} />
    </>
  );
}

function QuotesPanel() {
  const q = useQuery({ queryKey: ["admin","quotes"], queryFn: api.quotes.list });
  return (
    <>
      <PanelHeader title="Quotes" subtitle="Draft, send and track proposals to clients." />
      <Table rows={q.data ?? []} cols={[
        { key: "num", label: "Number", render: r => <span className="font-mono text-xs">{r.number}</span> },
        { key: "client", label: "Client", render: r => <span className="font-medium">{r.clientName}</span> },
        { key: "total", label: "Total", render: r => `R ${r.total.toLocaleString()}` },
        { key: "created", label: "Created", render: r => new Date(r.createdAt).toLocaleDateString("en-ZA") },
        { key: "status", label: "Status", render: r => <StatusPill s={r.status} /> },
      ]} />
    </>
  );
}

function InvoicesPanel() {
  const q = useQuery({ queryKey: ["admin","invoices"], queryFn: api.invoices.list });
  return (
    <>
      <PanelHeader title="Invoices" subtitle="Send invoices, track payments, chase overdues." />
      <Table rows={q.data ?? []} cols={[
        { key: "num", label: "Number", render: r => <span className="font-mono text-xs">{r.number}</span> },
        { key: "client", label: "Client", render: r => <span className="font-medium">{r.clientName}</span> },
        { key: "total", label: "Total", render: r => `R ${r.total.toLocaleString()}` },
        { key: "due", label: "Due", render: r => r.dueDate },
        { key: "status", label: "Status", render: r => <StatusPill s={r.status} /> },
      ]} />
    </>
  );
}

function ClientsPanel() {
  const q = useQuery({ queryKey: ["admin","clients"], queryFn: api.clients.list });
  return (
    <>
      <PanelHeader title="Clients" subtitle="Every client relationship in one place." />
      <Table rows={q.data ?? []} cols={[
        { key: "id", label: "ID", render: r => <span className="font-mono text-xs">{r.id}</span> },
        { key: "name", label: "Name", render: r => <span className="font-medium">{r.name}</span> },
        { key: "industry", label: "Industry", render: r => r.industry },
        { key: "email", label: "Email", render: r => <span className="text-xs">{r.email}</span> },
        { key: "phone", label: "Phone", render: r => <span className="text-xs">{r.phone}</span> },
        { key: "since", label: "Client since", render: r => r.since },
        { key: "ltv", label: "Lifetime value", render: r => `R ${r.lifetimeValue.toLocaleString()}` },
      ]} />
    </>
  );
}

function RolesPanel() {
  const q = useQuery({ queryKey: ["admin","roles"], queryFn: api.roles.list });
  return (
    <>
      <PanelHeader title="Roles & Permissions" subtitle="Manage who can access the control centre." />
      <Table rows={q.data ?? []} cols={[
        { key: "email", label: "Email", render: r => <span className="font-medium">{r.email}</span> },
        { key: "role", label: "Role", render: r => <StatusPill s={r.role} /> },
        { key: "active", label: "Active", render: r => r.active ? "Yes" : "No" },
      ]} />
    </>
  );
}

function AuditPanel() {
  const q = useQuery({ queryKey: ["admin","audit"], queryFn: api.audit.list });
  return (
    <>
      <PanelHeader title="Audit Logs" subtitle="Every action, timestamped and attributable." />
      <Table rows={q.data ?? []} cols={[
        { key: "at", label: "When", render: r => new Date(r.at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) },
        { key: "actor", label: "Actor", render: r => <span className="text-xs font-mono">{r.actor}</span> },
        { key: "action", label: "Action", render: r => <span className="font-medium">{r.action}</span> },
        { key: "entity", label: "Entity", render: r => <span className="font-mono text-xs">{r.entity}</span> },
      ]} />
    </>
  );
}
