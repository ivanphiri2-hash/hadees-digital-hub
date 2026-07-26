import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, GradientOrbs, BigCTA, Stat } from "@/components/site/ui";
import { Brain, FileSearch, MessageSquare, Sparkles, BarChart3, ShieldAlert, Bot, Workflow, BookOpen, Mic, Database, LineChart } from "lucide-react";

export const Route = createFileRoute("/enterprise-ai")({
  head: () => ({
    meta: [
      { title: "Enterprise AI — Document, Tender, Proposal & Invoice AI — Hadees Trading" },
      { name: "description", content: "Enterprise AI stack: Document AI, Tender AI, Proposal AI, Invoice AI, OCR, Speech, Compliance AI, Predictive AI and Multi-Agent Workflows for South African business." },
      { property: "og:title", content: "Enterprise AI — Hadees Trading" },
      { property: "og:description", content: "Production-grade AI for South African business — deployed, integrated and operated." },
      { property: "og:url", content: "/enterprise-ai" },
    ],
    links: [{ rel: "canonical", href: "/enterprise-ai" }],
  }),
  component: EAI,
});

const groups = [
  { title: "Document Intelligence", icon: FileSearch, items: [
    { n: "Document AI", d: "Read, classify and route any incoming document." },
    { n: "PDF Intelligence", d: "Extract tables, clauses and signatures from PDFs." },
    { n: "OCR", d: "Scan paper docs, ID books, invoices to structured data." },
    { n: "Speech Recognition", d: "Turn calls & voice notes into searchable text." },
    { n: "Knowledge Base", d: "Grounded AI answers from your own docs." },
    { n: "AI Memory", d: "Long-term recall across projects and clients." },
  ]},
  { title: "Revenue & Operations", icon: MessageSquare, items: [
    { n: "Tender AI", d: "Match, score and prep responses to public tenders." },
    { n: "Proposal AI", d: "Draft winning proposals from a brief in minutes." },
    { n: "Invoice AI", d: "Auto-generate, dispatch and reconcile invoices." },
    { n: "AI Chat", d: "Branded chat trained on your knowledge base." },
    { n: "Prompt Library", d: "Governed, reusable prompts for your team." },
  ]},
  { title: "Risk & Insight", icon: ShieldAlert, items: [
    { n: "Compliance AI", d: "Watch CIPC, SARS, COIDA, B-BBEE deadlines." },
    { n: "Risk Analysis", d: "Flag contract, cashflow and compliance risk." },
    { n: "Predictive AI", d: "Forecast pipeline, cashflow and workload." },
    { n: "Business Intelligence", d: "One dashboard, every KPI, no spreadsheets." },
  ]},
  { title: "Autonomous", icon: Bot, items: [
    { n: "Agentic AI", d: "Agents that take multi-step action, safely." },
    { n: "Multi-Agent Workflows", d: "Orchestrated teams of agents per workflow." },
  ]},
];

function EAI() {
  return (
    <>
      <section className="relative overflow-hidden">
        <GradientOrbs />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Brain className="h-3.5 w-3.5 text-[var(--color-royal-soft)]" /> Enterprise AI Stack
            </div>
            <h1 className="mt-6 text-balance font-display text-5xl font-black tracking-tight sm:text-6xl">
              Production AI. <span className="gradient-text">Deployed to production.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
              Not a chatbot demo. A working AI layer that reads your documents, drafts your proposals, watches compliance and predicts risk — running inside your business.
            </p>
          </div>

          <div className="mt-14">
            <AIConsole />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={27} label="AI Agents" />
          <Stat value={98} suffix="%" label="Doc extraction accuracy" />
          <Stat value={6} suffix="x" label="Faster proposal drafts" />
          <Stat value={40} suffix="%" label="Compliance workload cut" />
        </div>
      </Section>

      <Section eyebrow="Stack" title={<>Every layer of the AI operation.</>}>
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <GlassCard key={g.title}>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-royal)]/15 text-[var(--color-royal-soft)]">
                  <g.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold">{g.title}</h3>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {g.items.map((i) => (
                  <li key={i.n} className="rounded-xl border border-border/60 bg-card/40 p-3">
                    <div className="text-sm font-semibold">{i.n}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{i.d}</div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Delivery" title={<>How we ship AI into your business.</>}>
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { i: BookOpen, t: "1. Discover", b: "Map your workflows, docs and decisions." },
            { i: Workflow, t: "2. Design", b: "Agent architecture, guardrails, evals." },
            { i: Database, t: "3. Deploy", b: "Ship into IVAN OS or your existing stack." },
            { i: LineChart, t: "4. Operate", b: "Measure, tune and grow the AI over time." },
          ].map((s) => (
            <GlassCard key={s.t}>
              <s.i className="h-5 w-5 text-[var(--color-gold)]" />
              <div className="mt-3 font-display text-lg font-bold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.b}</div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <BigCTA title="Turn AI into revenue." subtitle="We deploy, integrate and operate your enterprise AI stack." primary={{ label: "Start with AI", to: "/contact" }} secondary={{ label: "See IVAN OS", to: "/ivan-os" }} />
    </>
  );
}

function AIConsole() {
  return (
    <div className="glass relative overflow-hidden rounded-3xl border border-border/60 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_var(--color-royal)]" />
          <span className="font-mono">ivan.console · live</span>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <Chip>gpt · claude · gemini</Chip>
          <Chip>27 agents online</Chip>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Prompt
          </div>
          <div className="mt-2 rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed text-foreground/80">
            <span className="text-[var(--color-gold)]">/</span>tender scout — closing this week — construction, North West — B-BBEE Level 4+
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Response · Proposal AI · 2.1s
          </div>
          <div className="mt-2 grid gap-2 text-xs">
            {[
              { t: "DWS/NW/24/25/RB-013 · Roads maintenance · closes Fri", s: "match 92%" },
              { t: "NWDPW-011/2026 · Public works refurbishment · closes Thu", s: "match 87%" },
              { t: "MMLM/017/26 · Water pipeline upgrade · closes Wed", s: "match 81%" },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between rounded-lg border border-border/60 bg-black/20 p-2.5">
                <span className="truncate">{r.t}</span>
                <span className="ml-3 shrink-0 rounded-full bg-[var(--color-royal)]/20 px-2 py-0.5 font-mono text-[10px] text-[var(--color-royal-soft)]">{r.s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" /> Signals
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "Docs read", v: "1,284" },
                { l: "Auto-drafts", v: "47" },
                { l: "Alerts", v: "9" },
              ].map((k) => (
                <div key={k.l} className="rounded-lg border border-border/60 bg-black/20 p-2">
                  <div className="font-display text-lg font-bold">{k.v}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mic className="h-3.5 w-3.5" /> Live agents
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              {["Tender Scout", "Proposal Writer", "Compliance Watchdog", "Invoice AI"].map((n, i) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-border/60 bg-black/20 px-3 py-2">
                  <span className="font-medium">{n}</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {["thinking","drafting","watching","reconciling"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border/60 bg-card/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">{children}</span>;
}
