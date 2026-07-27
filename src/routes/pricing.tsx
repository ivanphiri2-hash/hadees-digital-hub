import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Lock, CreditCard } from "lucide-react";

import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { PRICED_SERVICES } from "@/lib/company";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Transparent ZAR pricing for every service" },
      { name: "description", content: "Every Hadees Trading service and its price in one place. Company registration, websites, COIDA, NHBRC, B-BBEE, PSIRA assistance & more." },
      { property: "og:title", content: "Pricing — Hadees Trading" },
      { property: "og:description", content: "Transparent ZAR pricing for every service." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: PRICED_SERVICES.map((s, i) => ({
          "@type": "Offer",
          position: i + 1,
          name: s.name,
          price: s.amount,
          priceCurrency: "ZAR",
        })),
      }),
    }],
  }),
  component: PricingPage,
});

function PricingPage() {
  const grouped = PRICED_SERVICES.reduce<Record<string, typeof PRICED_SERVICES[number][]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <Section
        as="h1"
        eyebrow="Pricing"
        title={<>Every service. Every price. No surprises.</>}
        intro="Transparent, fixed pricing in South African Rand. Pay securely with PayFast — Instant EFT, Visa, Mastercard, Capitec Pay, Apple Pay & Google Pay."
      >
        <div className="mx-auto mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Secure Payment by PayFast</span>
          <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-[var(--color-gold)]" /> SSL Secured</span>
          <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-[var(--color-gold)]" /> All major SA payment methods</span>
        </div>

        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-xl font-bold">{category}</h2>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{items.length} service{items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <GlassCard key={s.slug} className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold">{s.name}</h3>
                          {"badge" in s && s.badge && (
                            <span className="rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]">{s.badge}</span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">Starting from</div>
                      </div>
                      <div className="rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-sm font-bold text-[var(--color-gold)]">{s.price}</div>
                    </div>
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">{s.desc}</p>
                    {"disclaimer" in s && s.disclaimer && (
                      <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-300/90">
                        <span className="font-semibold">Important:</span> {s.disclaimer}
                      </div>
                    )}
                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        to="/checkout"
                        search={{ service: s.slug }}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--color-royal)] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Pay Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                      <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-border/70 px-4 py-2 text-xs font-semibold">
                        Enquire
                      </Link>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <BigCTA
        title="Ready to get started?"
        subtitle="Pick any service above and check out securely — or talk to us first."
        primary={{ label: "Talk to us", to: "/contact" }}
        secondary={{ label: "View packages", to: "/packages" }}
      />
    </>
  );
}
