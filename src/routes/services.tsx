import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Lock, CreditCard } from "lucide-react";

import { Section, BigCTA } from "@/components/site/ui";
import { ServiceCard } from "@/components/site/ServiceCard";
import { SERVICE_CATALOG, FEATURED_PACKAGES, PRICED_SERVICES } from "@/lib/company";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Pricing — Hadees Trading" },
      {
        name: "description",
        content:
          "Company registration South Africa, business compliance, NHBRC & CIDB registration assistance, tender support and website design — transparent ZAR pricing with secure PayFast checkout.",
      },
      { property: "og:title", content: "Services & Pricing — Hadees Trading" },
      { property: "og:description", content: "Business growth solutions South Africa: registration, compliance, tenders, websites and automation." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/services" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Hadees Trading services",
          itemListElement: PRICED_SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.name,
              description: s.desc,
              areaServed: "ZA",
              provider: { "@type": "Organization", name: "HADEES TRADING (PTY) LTD" },
              offers: { "@type": "Offer", price: s.amount, priceCurrency: "ZAR" },
            },
          })),
        }),
      },
    ],
  }),
  component: ServicesPage,
});

export function ServicesMarketplace() {
  return (
    <div className="space-y-16">
      {SERVICE_CATALOG.map((cat) => (
        <section key={cat.slug} id={cat.slug} aria-labelledby={`cat-${cat.slug}`} className="scroll-mt-24">
          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 id={`cat-${cat.slug}`} className="font-display text-2xl font-bold tracking-tight">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
            </div>
            <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
              {cat.services.length} services
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cat.services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function FeaturedPackages() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURED_PACKAGES.map((p) => (
        <div key={p.slug} className="glass relative flex h-full flex-col rounded-2xl p-6">
          {"badge" in p && p.badge && (
            <span className="absolute right-5 top-5 rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]">
              {p.badge}
            </span>
          )}
          <h3 className="font-display text-lg font-bold">{p.name}</h3>
          <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">Starting from</div>
          <div className="font-display text-3xl font-black gradient-text">{p.price}</div>
          <p className="mt-2 text-sm text-muted-foreground">{p.audience}</p>
          <ul className="mt-4 flex-1 space-y-1.5 text-xs text-foreground/85">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
                {f}
              </li>
            ))}
          </ul>
          <PaymentButton slug={p.slug} name={p.name} className="mt-5 w-full" />
          <Link
            to="/checkout"
            search={{ service: p.checkoutSlug }}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-royal)] px-4 text-sm font-semibold text-white"
          >
            Get Started <ArrowRight aria-hidden className="ml-1.5 h-4 w-4" />
          </Link>

        </div>
      ))}
    </div>
  );
}

function ServicesPage() {
  return (
    <>
      <Section
        as="h1"
        eyebrow="Services Marketplace"
        title={<>Every service your business needs, priced upfront.</>}
        intro="Registration, compliance, construction, tenders, websites, branding and automation — delivered by specialists, paid securely with PayFast."
      >
        <div className="mx-auto mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck aria-hidden className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Secure Payment by PayFast</span>
          <span className="inline-flex items-center gap-1.5"><Lock aria-hidden className="h-3.5 w-3.5 text-[var(--color-gold)]" /> SSL Secured</span>
          <span className="inline-flex items-center gap-1.5"><CreditCard aria-hidden className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Instant EFT, Cards, Capitec Pay & more</span>
        </div>

        <nav aria-label="Service categories" className="mb-12 flex flex-wrap justify-center gap-2">
          {SERVICE_CATALOG.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border/60 bg-card/40 px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.name}
            </a>
          ))}
        </nav>

        <ServicesMarketplace />
      </Section>

      <Section eyebrow="Featured Packages" title="Bundled for where you are right now" intro="Four curated packages that combine our most requested services at one price.">
        <FeaturedPackages />
      </Section>

      <BigCTA
        title="Not sure which service you need?"
        subtitle="Send us your goal — we'll bundle the right services and quote you a fixed price."
        primary={{ label: "Talk to a specialist", to: "/contact" }}
        secondary={{ label: "See Pricing", to: "/pricing" }}
      />
    </>
  );
}
