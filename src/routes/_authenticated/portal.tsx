import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FolderOpen, Receipt, FileText, LifeBuoy, LogOut } from "lucide-react";
import { getPortalData } from "@/lib/portal.functions";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard, StatusPill, AdminPanel, money, shortDate } from "@/components/admin/shell";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Hadees Trading" },
      { name: "description", content: "Track your projects, invoices, receipts and documents with Hadees Trading." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Client Portal — Hadees Trading" },
      { property: "og:description", content: "Your projects, invoices and documents in one secure place." },
    ],
  }),
  component: Portal,
});

function Portal() {
  const navigate = useNavigate();
  const fetchPortal = useServerFn(getPortalData);
  const { data, isLoading } = useQuery({ queryKey: ["portal"], queryFn: () => fetchPortal({}) });

  if (isLoading) return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading your portal…</div>;

  const outstanding = (data?.invoices ?? []).filter((i) => i.status !== "paid" && i.status !== "void")
    .reduce((s, i) => s + (i.total_cents - i.amount_paid_cents), 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Client Portal</div>
          <h1 className="font-display text-3xl font-black">{data?.client?.company_name ?? data?.client?.full_name ?? "Welcome"}</h1>
        </div>
        <button onClick={() => void supabase.auth.signOut().then(() => navigate({ to: "/auth", search: {}, replace: true }))}
          className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      {!data?.client && (
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          Your account isn't linked to a client record yet. Our team links it as soon as your first order or quotation is processed.{" "}
          <Link to="/contact" className="text-[var(--color-royal-soft)]">Contact us</Link>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active projects" value={String((data?.projects ?? []).filter((p) => p.status !== "completed" && p.status !== "archived").length)} />
        <KpiCard label="Amount due" value={money(outstanding)} tone={outstanding > 0 ? "gold" : "green"} />
        <KpiCard label="Documents" value={String((data?.documents ?? []).length)} />
        <KpiCard label="Open tickets" value={String((data?.tickets ?? []).filter((t) => t.status === "open" || t.status === "in_progress").length)} />
      </div>

      <AdminPanel title="Projects">
        <div className="grid gap-2">
          {(data?.projects ?? []).length === 0 && <div className="text-sm text-muted-foreground">No projects yet.</div>}
          {(data?.projects ?? []).map((p) => (
            <div key={p.id} className="rounded-xl border border-border/60 bg-black/20 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><FolderOpen className="h-4 w-4 text-[var(--color-royal-soft)]" />{p.name}</div>
                <StatusPill status={p.status} />
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[var(--color-royal)]" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{p.progress}% complete · due {shortDate(p.due_date)}</div>
            </div>
          ))}
        </div>
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Invoices">
          <div className="grid gap-2">
            {(data?.invoices ?? []).length === 0 && <div className="text-sm text-muted-foreground">No invoices yet.</div>}
            {(data?.invoices ?? []).map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2.5">
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">{i.number}</div>
                  <div className="text-sm font-semibold">{i.title}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold">{money(i.total_cents)}</span>
                  <StatusPill status={i.status} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Quotations">
          <div className="grid gap-2">
            {(data?.quotations ?? []).length === 0 && <div className="text-sm text-muted-foreground">No quotations yet.</div>}
            {(data?.quotations ?? []).map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2.5">
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">{q.number}</div>
                  <div className="text-sm font-semibold">{q.title}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold">{money(q.total_cents)}</span>
                  <StatusPill status={q.status} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Documents">
          <div className="grid gap-2">
            {(data?.documents ?? []).length === 0 && <div className="text-sm text-muted-foreground">No documents shared yet.</div>}
            {(data?.documents ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--color-royal-soft)]" />{d.name}</span>
                <span className="text-[11px] text-muted-foreground">{shortDate(d.created_at)}</span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Receipts & support">
          <div className="grid gap-2">
            {(data?.receipts ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2"><Receipt className="h-4 w-4 text-emerald-400" />{r.number}</span>
                <span className="font-display font-bold">{money(r.amount_cents)}</span>
              </div>
            ))}
            {(data?.tickets ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-[var(--color-gold)]" />{t.subject}</span>
                <StatusPill status={t.status} />
              </div>
            ))}
            {(data?.receipts ?? []).length === 0 && (data?.tickets ?? []).length === 0 && (
              <div className="text-sm text-muted-foreground">Nothing here yet.</div>
            )}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
