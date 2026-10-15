import { ServiceFaq } from "@/components/site/ServiceFaq";
import { reviewedServiceSeo, serviceSearchScripts } from "@/lib/reviewed-service-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { REGISTRATION_PRICING } from "@/lib/company";
import { Check } from "lucide-react";
import { NationalDelivery } from "@/components/site/NationalDelivery";

export const Route = createFileRoute("/business-registration")({
  head: () => ({
    meta: [
      { title: reviewedServiceSeo["/business-registration"].title },
      { name: "description", content: reviewedServiceSeo["/business-registration"].description },
      { property: "og:title", content: reviewedServiceSeo["/business-registration"].title },
      { property: "og:description", content: reviewedServiceSeo["/business-registration"].description },
      { property: "og:url", content: "/business-registration" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: serviceSearchScripts("/business-registration"),
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
      <Section as="h1"
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
              <div className="mt-4 flex items-center gap-2">
                <Link to="/checkout" search={{ service: r.slug }} className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--color-royal)] px-3 py-1.5 text-xs font-semibold text-white">Pay Now</Link>
                <Link to="/contact" className="inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold">Enquire</Link>
              </div>
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
      <ServiceFaq path="/business-registration" />
      <NationalDelivery service="registration" />
    </>
  );
}
