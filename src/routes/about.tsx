import { FounderSection } from "@/components/site/FounderSection";
import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, GradientOrbs, BigCTA } from "@/components/site/ui";
import { COMPANY } from "@/lib/company";
import { Compass, Target, Heart, Users, Workflow, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hadees Trading (Pty) Ltd" },
      { name: "description", content: "Hadees Trading (Pty) Ltd is a Mahikeng-based enterprise services firm — websites, compliance, tenders and AI automation for South African business." },
      { property: "og:title", content: "About Hadees Trading" },
      { property: "og:description", content: "Our story, mission, values and process." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const values = [
  { icon: Heart, title: "Integrity", body: "We publish our prices. We honour our timelines. We tell the truth about scope." },
  { icon: Sparkles, title: "Excellence", body: "Every artefact — from a share certificate to a CRM — is finished to enterprise standard." },
  { icon: Users, title: "Partnership", body: "Your business outcomes are our KPIs. We win when you win a contract." },
  { icon: Workflow, title: "Automation", body: "If it can be automated, it should be. We build systems that give founders their time back." },
];

const timeline = [
  { year: "2025", title: "Hadees Trading is founded", body: "Established in Mahikeng to close the gap between SME reality and enterprise capability in South Africa." },
  { year: "Q2 2025", title: "Compliance & registration desk launched", body: "CIPC, SARS, COIDA, NHBRC, CIDB and CSD assistance formalised into fixed-price packages." },
  { year: "Q3 2025", title: "IVAN OS begins", body: "27 AI agents drafted, covering documents, tenders, invoices, CRM, compliance and knowledge." },
  { year: "Q4 2025", title: "Client Portal + Mobile", body: "Secure client portal and IVAN Mobile (Android / iPhone) roadmap opened." },
];

function About() {
  return (
    <>
      <section className="relative overflow-hidden">
        <GradientOrbs />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            About us
          </div>
          <h1 className="mt-6 text-balance font-display text-5xl font-black tracking-tight sm:text-6xl">
            An <span className="gradient-text">enterprise partner</span> built for South African founders.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Hadees Trading (Pty) Ltd was founded in {COMPANY.city} in {COMPANY.established} with a single mission: give South African SMEs the same operational firepower as the country's largest corporates — at fair, published prices.
          </p>
        </div>
      </section>

      <Section eyebrow="Our Story" title={<>Why we exist.</>}>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <GlassCard>
            <Compass className="h-6 w-6 text-[var(--color-royal-soft)]" />
            <h3 className="mt-3 font-display text-xl font-bold">Mission</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              To equip every South African business with the digital, compliance and AI infrastructure they need to compete, comply and win contracts.
            </p>
          </GlassCard>
          <GlassCard>
            <Target className="h-6 w-6 text-[var(--color-gold)]" />
            <h3 className="mt-3 font-display text-xl font-bold">Vision</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A South Africa where a founder in Mahikeng or Mthatha has the same platform quality as one in Sandton — powered by intelligent, locally-built systems.
            </p>
          </GlassCard>
        </div>
      </Section>

      <Section eyebrow="Core Values" title={<>What we hold ourselves to.</>}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }) => (
            <GlassCard key={title}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-royal)]/12 text-[var(--color-royal-soft)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Our Process" title={<>Discover · Design · Deliver · Automate.</>}>
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { n: "01", t: "Discover", b: "We map your workflows, compliance status and revenue goals." },
            { n: "02", t: "Design", b: "We architect the website, CRM and automation stack around your business." },
            { n: "03", t: "Deliver", b: "Fixed price, fixed timeline. Everything is launched to production standard." },
            { n: "04", t: "Automate", b: "IVAN OS agents keep your operation running — quotes, invoices, compliance and follow-ups." },
          ].map((s) => (
            <GlassCard key={s.n}>
              <div className="font-display text-3xl font-black text-[var(--color-royal-soft)]">{s.n}</div>
              <h3 className="mt-1 font-display text-lg font-bold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Timeline" title={<>Our journey so far.</>}>
        <div className="mx-auto max-w-3xl">
          <ol className="relative border-l border-border/60 pl-6">
            {timeline.map((t) => (
              <li key={t.title} className="mb-8">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-[var(--color-gold)] shadow-[0_0_10px_var(--color-gold)]" />
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{t.year}</div>
                <div className="mt-1 font-display text-lg font-bold">{t.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section eyebrow="Leadership" title={<>Led from Mahikeng, built for South Africa.</>}>
        <div className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
          Hadees Trading is led by a small, senior team of operators, developers and compliance specialists who have built and supported SA SMEs across construction, services, retail and the public sector. We deliberately stay lean so that our clients get direct access to the people building their systems.
        </div>
      </Section>

      <FounderSection />

      <BigCTA
        title="Ready to work with us?"
        subtitle="Start with a website, a registration, or a full-stack rollout. Same team, either way."
        primary={{ label: "Book a consult", to: "/contact" }}
        secondary={{ label: "See Services", to: "/services" }}
      />
    </>
  );
}
