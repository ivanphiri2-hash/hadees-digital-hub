import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { FolderOpen, Receipt, FileText, LifeBuoy, LogOut, Globe } from "lucide-react";
import { getPortalData, createMyTicket } from "@/lib/portal.functions";
import { getMyWebsites } from "@/lib/crm.functions";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard, StatusPill, AdminPanel, money, shortDate } from "@/components/admin/shell";
import { PortalMessages } from "@/components/portal/PortalMessages";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Hadees Trading" },
      { name: "description", content: "Track your projects, invoices, receipts and documents with Hadees Trading." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Client Portal — Hadees Trading" },
      { property: "og:description", content: "Your projects, invoices and documents in one secure place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Portal,
});

function Portal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchPortal = useServerFn(getPortalData);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["portal"], queryFn: () => fetchPortal({}) });

  if (isLoading) return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading your portal…</div>;
  if (error) return <div className="mx-auto grid max-w-xl gap-4 px-4 py-10"><p role="alert">{error.message}</p><Button onClick={() => void refetch()}>Try again</Button></div>;

  const outstanding = (data?.invoices ?? []).filter((i) => i.status !== "paid" && i.status !== "void")
    .reduce((s, i) => s + (i.total_cents - i.amount_paid_cents), 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Client Portal</div>
          <h1 className="font-display text-3xl font-black">{data?.client?.company_name ?? data?.client?.full_name ?? "Welcome"}</h1>
          {data?.client?.client_number && (
            <div className="mt-1 text-xs text-muted-foreground">Client number <span className="font-semibold text-[var(--color-gold)]">{data.client.client_number}</span></div>
          )}
        </div>
        <Button variant="outline" onClick={async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          await navigate({ to: "/auth", search: {}, replace: true });
        }}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
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

      <AdminPanel title="Payment history">
        <div className="grid gap-3">
          {!data?.payments.length && <p className="text-sm text-muted-foreground">No payment records yet.</p>}
          {data?.payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3">
            <div><p className="text-sm font-semibold">{money(payment.amount_cents)}</p><p className="text-xs text-muted-foreground">{payment.reference ?? payment.method} · {shortDate(payment.paid_at ?? payment.created_at)}</p></div>
            <StatusPill status={payment.status} />
          </div>)}
        </div>
      </AdminPanel>
      {data?.client && <PortalRequest />}

      <PortalWebsites />

      <PortalMessages />
    </div>
  );
}

function PortalRequest() {
  const submit = useServerFn(createMyTicket);
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return <AdminPanel title="Submit a request"><form className="grid gap-4" onSubmit={async (event) => {
    event.preventDefault(); setPending(true); setMessage(""); setError("");
    try { await submit({ data: { subject, body, priority: "normal" } }); setSubject(""); setBody(""); setMessage("Your request was submitted."); await queryClient.invalidateQueries({ queryKey: ["portal"] }); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Unable to submit your request. Please try again."); }
    finally { setPending(false); }
  }}>
    <label className="grid gap-2 text-sm">Subject<input required minLength={3} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-md border border-input bg-background px-3 py-2" /></label>
    <label className="grid gap-2 text-sm">Request details<textarea required minLength={5} maxLength={4000} rows={4} value={body} onChange={(event) => setBody(event.target.value)} className="rounded-md border border-input bg-background px-3 py-2" /></label>
    <div><Button disabled={pending}>{pending ? "Submitting…" : "Submit request"}</Button></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
  </form></AdminPanel>;
}

/** Client-safe website summary — status and links only, never internal build details. */
function PortalWebsites() {
  const fetchSites = useServerFn(getMyWebsites);
  const { data } = useQuery({ queryKey: ["portal", "websites"], queryFn: () => fetchSites({}) });
  if (!data || data.length === 0) return null;

  return (
    <AdminPanel title="Your website">
      <div className="grid gap-2">
        {data.map((w) => (
          <div key={w.id} className="rounded-xl border border-border/60 bg-black/20 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold"><Globe className="h-4 w-4 text-[var(--color-royal-soft)]" />{w.name}</span>
              <StatusPill status={w.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              {w.domain && <span>{w.domain}</span>}
              {w.live_url && <a className="text-[var(--color-royal-soft)]" href={w.live_url} target="_blank" rel="noreferrer">View live site</a>}
              {w.demo_url && <a className="text-[var(--color-royal-soft)]" href={w.demo_url} target="_blank" rel="noreferrer">View demo</a>}
              <span>Updated {shortDate(w.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
