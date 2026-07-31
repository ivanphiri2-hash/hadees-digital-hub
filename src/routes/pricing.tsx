import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, CreditCard } from "lucide-react";

import { Section, BigCTA } from "@/components/site/ui";
import { ServicesMarketplace, FeaturedPackages } from "@/routes/services";
import { PRICED_SERVICES } from "@/lib/company";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Transparent ZAR pricing, no surprises" },
      {
        name: "description",
        content:
          "Fixed ZAR pricing for company registration, tax clearance, COIDA, NHBRC & CIDB registration assistance, tender support, websites and branding. Pay securely with PayFast.",
      },
      { property: "og:title", content: "Pricing — Hadees Trading" },
      { property: "og:description", content: "Transparent ZAR pricing for every business growth service." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: PRICED_SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: s.name,
              description: s.desc,
              offers: { "@type": "Offer", price: s.amount, priceCurrency: "ZAR", availability: "https://schema.org/InStock" },
            },
          })),
        }),
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <>
      <Section
        as="h1"
        eyebrow="Pricing"
        title={<>Every service. Every price. No surprises.</>}
        intro="Transparent, fixed pricing in South African Rand. Pay securely with PayFast — Instant EFT, Visa, Mastercard, Capitec Pay, Apple Pay & Google Pay."
      >
        <div className="mx-auto mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck aria-hidden className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Secure Payment by PayFast</span>
          <span className="inline-flex items-center gap-1.5"><Lock aria-hidden className="h-3.5 w-3.5 text-[var(--color-gold)]" /> SSL Secured</span>
          <span className="inline-flex items-center gap-1.5"><CreditCard aria-hidden className="h-3.5 w-3.5 text-[var(--color-gold)]" /> All major SA payment methods</span>
        </div>

        <div className="mb-16">
          <h2 className="mb-6 text-center font-display text-2xl font-bold">Featured packages</h2>
          <FeaturedPackages />
        </div>

        <ServicesMarketplace />
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
