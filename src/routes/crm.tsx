import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { Users, Briefcase, FolderKanban, Receipt, FileText, CheckSquare, Calendar, FileArchive, BarChart3, GitBranch, PieChart, KeyRound, ScrollText, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — Enterprise CRM for South African Business — Hadees Trading" },
      { name: "description", content: "Enterprise CRM: leads, clients, projects, quotes, invoices, tasks, calendar, documents, pipeline, reporting, permissions and audit logs." },
      { property: "og:title", content: "CRM — Hadees Trading" },
      { property: "og:description", content: "Own your pipeline with an enterprise-grade CRM built for SA workflows." },
      { property: "og:url", content: "/crm" },
    ],
    links: [{ rel: "canonical", href: "/crm" }],
  }),
  component: CRM,
});

const modules = [
  { i: LayoutDashboard, n: "Enterprise Dashboard", d: "One glance. Whole business." },
  { i: Users, n: "Leads", d: "Capture, score and route in real time." },
  { i: Briefcase, n: "Clients", d: "Every relationship, one record." },
  { i: FolderKanban, n: "Projects", d: "Kanban, gantt & milestones." },
  { i: Receipt, n: "Invoices", d: "Send, track and reconcile invoices." },
  { i: FileText, n: "Quotes", d: "Draft, send, chase and convert." },
  { i: CheckSquare, n: "Tasks", d: "Team tasks with SLAs and owners." },
  { i: Calendar, n: "Calendar", d: "Bookings, kickoffs & follow-ups." },
  { i: FileArchive, n: "Documents", d: "Contracts, certificates & templates." },
  { i: BarChart3, n: "Reporting", d: "Board-ready reports on tap." },
  { i: GitBranch, n: "Sales Pipeline", d: "Custom stages per revenue line." },
  { i: PieChart, n: "Analytics", d: "Cohorts, funnel, retention & LTV." },
  { i: KeyRound, n: "Permissions", d: "Role-based access down to fields." },
  { i: ScrollText, n: "Audit Logs", d: "Every action, timestamped." },
];

function CRM() {
  return (
    <>
      <Section as="h1"
        eyebrow="CRM"
        title={<>An enterprise CRM you actually enjoy using.</>}
        intro="Every module is designed around the SA sales & delivery workflow — from a WhatsApp lead to a signed-off project."
      >
        <PipelineBoard />
      </Section>

      <Section eyebrow="Modules" title={<>14 modules, one system.</>}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {modules.map((m) => (
            <GlassCard key={m.n}>
              <m.i className="h-5 w-5 text-[var(--color-royal-soft)]" />
              <div className="mt-3 font-display text-base font-bold">{m.n}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.d}</div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Dashboard" title={<>One glance. Whole business.</>}>
        <div className="glass rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { l: "Pipeline value", v: "R 2.14M", t: "royal" },
              { l: "Open quotes", v: "38", t: "gold" },
              { l: "Overdue invoices", v: "R 84,200", t: "red" },
              { l: "Win rate (90d)", v: "42%", t: "green" },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
                <div className={`mt-1 font-display text-2xl font-bold ${k.t === "royal" ? "text-[var(--color-royal-soft)]" : k.t === "gold" ? "text-[var(--color-gold)]" : k.t === "red" ? "text-red-400" : "text-emerald-400"}`}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <BigCTA title="Get your CRM live." subtitle="We migrate your data, configure pipelines and train your team." primary={{ label: "Deploy CRM", to: "/contact" }} secondary={{ label: "Preview admin", to: "/admin/login" }} />
    </>
  );
}

function PipelineBoard() {
  const cols = [
    { name: "New", tone: "royal", items: [
      { c: "Molefe Co.", v: "R 5,500", s: "Website" },
      { c: "Kagiso Films", v: "R 12,000", s: "Branding" },
    ]},
    { name: "Qualified", tone: "gold", items: [
      { c: "Build-It Civils", v: "R 500", s: "Tender review" },
      { c: "Ndaba Transport", v: "R 8,500", s: "AI chat" },
    ]},
    { name: "Proposal", tone: "royal", items: [
      { c: "Kgomo Holdings", v: "R 22,000", s: "CRM + Portal" },
    ]},
    { name: "Won", tone: "green", items: [
      { c: "Sithole Events", v: "R 18,500", s: "Premium site" },
      { c: "Rakgotso Farms", v: "R 4,400", s: "Compliance" },
    ]},
  ] as const;

  return (
    <div className="glass overflow-hidden rounded-3xl border border-border/60 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">Sales pipeline · Q3 2026</div>
        <div className="font-mono text-muted-foreground">total · R 71,400</div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {cols.map((c) => (
          <div key={c.name} className="rounded-2xl border border-border/60 bg-card/40 p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest">
              <span className={c.tone === "royal" ? "text-[var(--color-royal-soft)]" : c.tone === "gold" ? "text-[var(--color-gold)]" : "text-emerald-300"}>{c.name}</span>
              <span className="text-muted-foreground">{c.items.length}</span>
            </div>
            <div className="grid gap-2">
              {c.items.map((i) => (
                <div key={i.c} className="rounded-xl border border-border/60 bg-black/20 p-2.5">
                  <div className="text-sm font-semibold">{i.c}</div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{i.s}</span><span className="font-mono">{i.v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
