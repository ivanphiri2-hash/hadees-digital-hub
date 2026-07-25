import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { FileSearch, Bell, FileCheck2, Building2 } from "lucide-react";

export const Route = createFileRoute("/tenders")({
  head: () => ({
    meta: [
      { title: "Tender Services — Government & Municipal Tenders — Hadees Trading" },
      { name: "description", content: "Find, prepare and submit government, municipal and CIDB tenders. Matching engine, alerts, document preparation and tender assistance." },
      { property: "og:title", content: "Tender Services — Hadees Trading" },
      { property: "og:description", content: "Win more contracts. We handle the paperwork." },
      { property: "og:url", content: "/tenders" },
    ],
    links: [{ rel: "canonical", href: "/tenders" }],
  }),
  component: Tenders,
});

function Tenders() {
  return (
    <>
      <Section
        eyebrow="Tenders"
        title={<>Win more contracts. We handle the paperwork.</>}
        intro="From CSD to CIDB to municipal RFQs, our tender desk finds opportunities and gets you submission-ready."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileSearch, t: "Matching Engine", b: "We match your CIDB grade, sector and geography to open tenders." },
            { icon: Bell, t: "Tender Alerts", b: "Daily alerts for government, municipal and parastatal opportunities." },
            { icon: FileCheck2, t: "Document Preparation", b: "SBD forms, compliance packs, technical & pricing schedules." },
            { icon: Building2, t: "CIDB & CSD Ready", b: "We register, upgrade and maintain your CIDB grading & CSD profile." },
          ].map(({ icon: Icon, t, b }) => (
            <GlassCard key={t}>
              <Icon className="h-6 w-6 text-[var(--color-royal-soft)]" />
              <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="What we cover" title={<>Government · Municipal · Parastatal · Private.</>}>
        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
          {[
            "National & provincial government tenders",
            "Municipal RFQs and tenders",
            "CIDB grading, upgrades & renewals",
            "SBD form completion (SBD 1–9)",
            "Tender document review before submission",
            "Post-award compliance & delivery documentation",
          ].map((s) => (
            <div key={s} className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm">{s}</div>
          ))}
        </div>
      </Section>

      <BigCTA title="Ready to submit your first tender?" subtitle="We'll build a compliant, professional submission — start-to-finish." primary={{ label: "Get tender help", to: "/contact" }} />
    </>
  );
}
