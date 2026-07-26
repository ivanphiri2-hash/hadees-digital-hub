import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, GradientOrbs, BigCTA, Stat } from "@/components/site/ui";
import { Bot, Brain, Network, Gauge, Sparkles, Workflow } from "lucide-react";

export const Route = createFileRoute("/ivan-os")({
  head: () => ({
    meta: [
      { title: "IVAN OS — 27 AI Agents for SA Business" },
      { name: "description", content: "IVAN OS: 27 AI agents, decision console, knowledge graph, predictive analytics and business intelligence — built for South African business." },
      { property: "og:title", content: "IVAN OS — 27 AI Agents for SA Business" },
      { property: "og:description", content: "Enterprise AI, automation, CRM and compliance in one operating system." },
      { property: "og:url", content: "/ivan-os" },
    ],
    links: [{ rel: "canonical", href: "/ivan-os" }],
  }),
  component: IVAN,
});

const agents = [
  "Document Intake", "OCR & Extraction", "Tender Scout", "Proposal Writer", "Invoice AI", "Quote Generator",
  "Compliance Watchdog", "CIPC Monitor", "SARS Sync", "COIDA Tracker", "CIDB Watch", "B-BBEE Assistant",
  "Lead Router", "Client Success", "Follow-up Bot", "WhatsApp Concierge", "Email Autoresponder", "Meeting Notetaker",
  "Knowledge Base", "Prompt Librarian", "Data Cleaner", "Report Composer", "BI Analyst", "Risk Scanner",
  "Predictive Forecast", "Anomaly Detector", "Onboarding Coach",
];

function IVAN() {
  return (
    <>
      <section className="relative overflow-hidden">
        <GradientOrbs />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            IVAN OS · Intelligent Virtual Automation Network
          </div>
          <h1 className="mt-6 text-balance font-display text-5xl font-black tracking-tight sm:text-6xl">
            An <span className="gradient-text">operating system</span> for your business.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            27 AI agents. One decision console. A knowledge graph of your operation. IVAN OS is how South African SMEs run like enterprises.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={27} label="AI Agents" />
          <Stat value={100} suffix="+" label="Automations" />
          <Stat value={98} suffix="%" label="Accuracy on Docs" />
          <Stat value={24} suffix="/7" label="Always-on" />
        </div>
      </Section>

      <Section eyebrow="Capability" title={<>What IVAN does.</>}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Bot, t: "27 AI Agents", b: "Specialised agents for documents, tenders, invoices, CRM, compliance and BI." },
            { icon: Brain, t: "Enterprise AI", b: "Multi-model, multi-provider AI with memory, prompt library and safety." },
            { icon: Workflow, t: "Automation", b: "Automate quotes, invoices, reminders, follow-ups and reporting." },
            { icon: Network, t: "Knowledge Graph", b: "Every client, project, document and deadline linked in one graph." },
            { icon: Gauge, t: "Decision Console", b: "One console: pipeline value, tender status, compliance score, cashflow." },
            { icon: Sparkles, t: "Predictive Analytics", b: "Forecast cashflow, tender win-rate and workload risk." },
          ].map(({ icon: Icon, t, b }) => (
            <GlassCard key={t}>
              <Icon className="h-6 w-6 text-[var(--color-royal-soft)]" />
              <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Agent Roster" title={<>Meet the 27 agents.</>}>
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {agents.map((a, i) => (
            <div key={a} className="glass flex items-center gap-3 rounded-xl p-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-royal)]/15 font-display text-xs font-bold text-[var(--color-royal-soft)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm font-medium">{a}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Roadmap" title={<>What's next.</>}>
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {[
            { t: "Voice Command Layer", b: "Full voice control over IVAN OS on desktop & mobile." },
            { t: "SA Tax Copilot", b: "Real-time SARS filing assistance and VAT reconciliation." },
            { t: "Municipal Tender Radar", b: "Deeper coverage of local municipality opportunities." },
          ].map((r) => (
            <GlassCard key={r.t}>
              <h3 className="font-display text-lg font-bold">{r.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <BigCTA title="Deploy IVAN OS in your business." subtitle="Book a walkthrough and see the console live." primary={{ label: "Request a demo", to: "/contact" }} secondary={{ label: "Enterprise AI", to: "/enterprise-ai" }} />
    </>
  );
}
