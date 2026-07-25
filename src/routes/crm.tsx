import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — Enterprise CRM for South African Business — Hadees Trading" },
      { name: "description", content: "Enterprise CRM: leads, clients, projects, quotes, invoices, tasks, calendar, documents, pipeline, reporting, permissions and audit logs." },
      { property: "og:title", content: "CRM — Hadees Trading" },
      { property: "og:description", content: "Own your pipeline with an enterprise-grade CRM." },
      { property: "og:url", content: "/crm" },
    ],
    links: [{ rel: "canonical", href: "/crm" }],
  }),
  component: CRM,
});

const modules = [
  "Enterprise Dashboard", "Leads", "Clients", "Projects", "Invoices", "Quotes",
  "Tasks", "Calendar", "Documents", "Reporting", "Sales Pipeline", "Analytics",
  "Permissions", "Audit Logs",
];

function CRM() {
  return (
    <>
      <Section
        eyebrow="CRM"
        title={<>An enterprise CRM you actually enjoy using.</>}
        intro="Every module is designed around the SA sales & delivery workflow — from a WhatsApp lead to a signed-off project."
      >
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {modules.map((m) => (
            <GlassCard key={m}>
              <div className="font-display text-base font-bold">{m}</div>
              <div className="mt-1 text-xs text-muted-foreground">Included</div>
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

      <BigCTA title="Get your CRM live." subtitle="We migrate your data, configure pipelines and train your team." primary={{ label: "Deploy CRM", to: "/contact" }} />
    </>
  );
}
