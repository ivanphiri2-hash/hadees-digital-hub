import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { REGISTRATION_PRICING } from "@/lib/company";
import { Check } from "lucide-react";

export const Route = createFileRoute("/business-registration")({
  head: () => ({
    meta: [
      { title: "Business Registration & Compliance Pricing — Hadees Trading" },
      { name: "description", content: "Fixed prices in ZAR: Company Registration R950, COIDA R3,500, NHBRC R4,500, B-BBEE R350, tax clearance and more." },
      { property: "og:title", content: "Business Registration — Hadees Trading" },
      { property: "og:description", content: "CIPC, COIDA, NHBRC, CIDB, CSD, tax, B-BBEE — all handled." },
      { property: "og:url", content: "/business-registration" },
    ],
    links: [{ rel: "canonical", href: "/business-registration" }],
  }),
  component: BizReg,
});

const covers = [
  "Company Registration (CIPC)",
  "COIDA Registration",
  "NHBRC Registration",
  "CIDB Registration",
  "CSD Registration (Central Supplier Database)",
  "Tax Registration & SARS Clearance",
  "B-BBEE Affidavit / Certificate",
  "Annual Returns (CIPC)",
  "Company Amendments (directors, address, shares)",
  "Compliance Monitoring",
];

function BizReg() {
  return (
    <>
      <Section
        eyebrow="Business Registration"
        title={<>From idea to fully-registered (Pty) Ltd.</>}
        intro="We handle every South African registration and compliance step, so you can focus on winning work."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {covers.map((c) => (
            <div key={c} className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-royal-soft)]" /> {c}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Pricing" title={<>Transparent pricing in South African Rand.</>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGISTRATION_PRICING.map((r) => (
            <GlassCard key={r.name}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-bold">{r.name}</h3>
                <div className="rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-sm font-bold text-[var(--color-gold)]">{r.price}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              <Link to="/contact" className="mt-4 inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold">Order now</Link>
            </GlassCard>
          ))}
        </div>
      </Section>

      <BigCTA
        title="Ready to register?"
        subtitle="Send us your ID, contact details and business name — we'll take it from there."
        primary={{ label: "Start registration", to: "/contact" }}
        secondary={{ label: "View compliance", to: "/compliance" }}
      />
    </>
  );
}
