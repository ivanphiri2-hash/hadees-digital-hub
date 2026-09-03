import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, Users, Briefcase, FolderKanban, Receipt, FileArchive,
  LifeBuoy, ScrollText, Settings, LogOut, CreditCard, ShoppingCart, FileText,
  FileSignature, CalendarDays, BarChart3, UserCog, Search, MessageSquare,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { globalSearch } from "@/lib/platform.functions";

export const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/clients", label: "Clients", icon: Briefcase },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "/admin/quotations", label: "Quotations", icon: FileSignature },
  { to: "/admin/billing", label: "Billing", icon: Receipt },
  { to: "/admin/documents", label: "Documents", icon: FileArchive },
  { to: "/admin/support", label: "Support", icon: LifeBuoy },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: UserCog },
  { to: "/admin/activity", label: "Activity", icon: ScrollText },
  { to: "/admin/system", label: "System Health", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;


export function money(cents: number | null | undefined) {
  return `R ${((cents ?? 0) / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function shortDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

const TONES: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-300",
  gold: "bg-amber-500/15 text-amber-300",
  red: "bg-red-500/15 text-red-300",
  royal: "bg-[color-mix(in_oklab,var(--color-royal)_22%,transparent)] text-[var(--color-royal-soft)]",
  muted: "bg-white/5 text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    ["paid", "completed", "accepted", "resolved", "active", "closed"].includes(s) ? "green"
    : ["pending", "sent", "in_progress", "review", "waiting_client", "open", "draft"].includes(s) ? "gold"
    : ["failed", "cancelled", "overdue", "rejected", "void"].includes(s) ? "red"
    : "royal";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${TONES[tone]}`}>
      {s.replace(/_/g, " ")}
    </span>
  );
}

export function KpiCard({ label, value, hint, tone = "royal" }: { label: string; value: string; hint?: string; tone?: "royal" | "gold" | "green" | "red" }) {
  const color = tone === "gold" ? "text-[var(--color-gold)]" : tone === "green" ? "text-emerald-400" : tone === "red" ? "text-red-400" : "text-[var(--color-royal-soft)]";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function AdminPanel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Sidebar + auth gate shared by every admin screen. */
export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { user, ready, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth", search: { redirect: "/admin" }, replace: true });
  }, [ready, user, navigate]);

  if (!ready) return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading control centre…</div>;
  if (!user) return null;

  if (!user.isStaff) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-xl font-bold">Staff access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">This account isn't assigned a staff role. Head to your client portal instead.</p>
          <Link to="/portal" className="mt-5 inline-flex rounded-full bg-[var(--color-royal)] px-5 py-2.5 text-sm font-semibold text-white">Open client portal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
        <div className="glass flex h-full flex-col rounded-2xl p-4">
          <div className="mb-4 px-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Control Centre</div>
            <div className="font-display text-lg font-bold">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.roles.map((r) => (
                <span key={r} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{r.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
          <nav className="grid gap-1">
            {ADMIN_NAV.map((t) => {
              const active = t.to === "/admin" ? pathname === "/admin" : pathname.startsWith(t.to);
              return (
                <Link key={t.to} to={t.to}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-[color-mix(in_oklab,var(--color-royal)_25%,transparent)] text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => { void signOut().then(() => navigate({ to: "/auth", search: { redirect: "/admin" } })); }}
            className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="grid content-start gap-6">
        <header className="grid gap-4">
          <GlobalSearch />
          <div>
            <h1 className="font-display text-2xl font-black sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        {children}
      </main>

    </div>
  );
}

/** Cross-module search bar available on every admin screen. */
export function GlobalSearch() {
  const run = useServerFn(globalSearch);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const q = term.trim();

  const results = useQuery({
    queryKey: ["admin", "search", q],
    queryFn: () => run({ data: { q } }),
    enabled: q.length >= 2,
  });

  const groups: { label: string; to: string; items: { key: string; primary: string; secondary: string }[] }[] = [
    { label: "Clients", to: "/admin/clients", items: (results.data?.clients ?? []).map((c) => ({ key: c.id, primary: c.full_name, secondary: c.company_name ?? c.email ?? "" })) },
    { label: "Leads", to: "/admin/leads", items: (results.data?.leads ?? []).map((l) => ({ key: l.id, primary: l.name, secondary: l.company ?? String(l.stage) })) },
    { label: "Invoices", to: "/admin/invoices", items: (results.data?.invoices ?? []).map((i) => ({ key: i.id, primary: i.number, secondary: i.title })) },
    { label: "Projects", to: "/admin/projects", items: (results.data?.projects ?? []).map((p) => ({ key: p.id, primary: p.name, secondary: String(p.status) })) },
    { label: "Orders", to: "/admin/orders", items: (results.data?.orders ?? []).map((o) => ({ key: o.id, primary: o.reference, secondary: o.service_name })) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/40 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search clients, leads, invoices, projects, orders…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q.length >= 2 && (
          <button onClick={() => { setTerm(""); setOpen(false); }} className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
        )}
      </div>

      {open && q.length >= 2 && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_96%,black)] p-3 shadow-2xl">
          {results.isLoading && <p className="text-xs text-muted-foreground">Searching…</p>}
          {!results.isLoading && groups.length === 0 && <p className="text-xs text-muted-foreground">No matches for “{q}”.</p>}
          <div className="grid gap-3">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{g.label}</div>
                <ul className="grid gap-1">
                  {g.items.map((it) => (
                    <li key={it.key}>
                      <Link to={g.to} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-1.5 text-sm hover:bg-white/5">
                        <span className="truncate">{it.primary}</span>
                        <span className="truncate text-[11px] text-muted-foreground">{it.secondary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
