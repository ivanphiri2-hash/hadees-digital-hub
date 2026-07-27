import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Check, ShieldCheck } from "lucide-react";

import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { findPricedService } from "@/lib/company";

export const Route = createFileRoute("/psira-registration")({
  head: () => ({
    meta: [
      { title: "PSIRA Registration Assistance — R1,500 — Hadees Trading" },
      { name: "description", content: "Assistance with PSIRA registration: document prep, application guidance, coordination with accredited training providers. Not a training provider." },
      { property: "og:title", content: "PSIRA Registration Assistance" },
      { property: "og:description", content: "Document prep and guidance for PSIRA registration. R1,500." },
      { property: "og:url", content: "/psira-registration" },
    ],
    links: [{ rel: "canonical", href: "/psira-registration" }],
  }),
  component: PsiraPage,
});

const INCLUDES = [
  "Preparation of required application documents",
  "Step-by-step application guidance",
  "Coordination with accredited PSIRA training providers",
  "Registration progress tracking",
  "WhatsApp support throughout the process",
];

function PsiraPage() {
  const svc = findPricedService("psira")!;
  return (
    <>
      <Section
        as="h1"
        eyebrow="New Service"
        title={<>PSIRA Registration Assistance.</>}
        intro="We help individuals navigate the PSIRA registration process from documents to accredited training coordination."
      >
        <div className="mx-auto max-w-4xl">
          {/* Prominent disclaimer */}
          <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
              <div className="text-sm text-amber-100/90">
                <div className="font-bold text-amber-200">Important Notice</div>
                <p className="mt-1">
                  HADEES TRADING (PTY) LTD is <span className="font-bold">NOT a PSIRA-accredited training provider</span>. We provide <span className="font-bold">consultation and registration assistance only</span>. Training is completed through accredited PSIRA training centres.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <GlassCard className="p-7">
              <h2 className="font-display text-xl font-bold">What's included</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {INCLUDES.map((i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-royal-soft)]" /> {i}</li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[var(--color-gold)]" />
                We do not issue PSIRA training certificates. Certified training is delivered exclusively by accredited PSIRA training centres.
              </div>
            </GlassCard>

            <GlassCard className="p-7">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Assistance Fee</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="font-display text-4xl font-black">{svc.price}</div>
                <div className="text-xs text-muted-foreground">once-off</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{svc.desc}</p>
              <div className="mt-5 grid gap-2">
                <Link
                  to="/checkout"
                  search={{ service: svc.slug }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {svc.cta} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-border/70 px-4 py-2.5 text-sm font-semibold">
                  Talk to us first
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      <BigCTA
        title="Ready to start your PSIRA journey?"
        subtitle="Apply today and we'll guide your documents through PSIRA and coordinate accredited training."
        primary={{ label: "Apply Now", to: "/checkout" }}
        secondary={{ label: "See all pricing", to: "/pricing" }}
      />
    </>
  );
}
