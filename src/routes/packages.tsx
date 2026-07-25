import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, BigCTA } from "@/components/site/ui";
import { WEBSITE_PACKAGES } from "@/lib/company";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Website Packages — R1,500 / R2,500 / R5,500 — Hadees Trading" },
      { name: "description", content: "Fixed-price website packages for South African businesses. Starter R1,500, Business R2,500, Premium R5,500. Enterprise quality, transparent pricing." },
      { property: "og:title", content: "Website Packages — Hadees Trading" },
      { property: "og:description", content: "Starter, Business & Premium websites for SA SMEs." },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: WEBSITE_PACKAGES.map((p, i) => ({
          "@type": "Offer",
          position: i + 1,
          name: p.name,
          price: p.price.replace(/[^0-9.]/g, ""),
          priceCurrency: "ZAR",
        })),
      }),
    }],
  }),
  component: Packages,
});

const compareRows = [
  ["Pages", "Up to 5", "Up to 10", "Unlimited core"],
  ["Custom design", "Template + brand colors", "Custom layout", "Bespoke UI/UX"],
  ["Mobile-first responsive", true, true, true],
  ["Contact form + WhatsApp", true, true, true],
  ["SEO essentials + schema", true, true, true],
  ["Blog / news module", false, true, true],
  ["Google Business + Maps", false, true, true],
  ["Lead capture & routing", false, true, true],
  ["Client portal & bookings", false, false, true],
  ["PayFast payments ready", false, false, true],
  ["CRM & AI automation hooks", false, false, true],
  ["Priority support", "Email", "Email + WhatsApp", "90 days priority"],
  ["Timeline", "5–7 days", "7–10 days", "10–20 days"],
] as const;

function Packages() {
  return (
    <>
      <Section
        eyebrow="Website Packages"
        title={<>Enterprise websites at SA-fair prices.</>}
        intro="Every package includes production hosting setup, SSL, on-page SEO and a mobile-first design system."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {WEBSITE_PACKAGES.map((p) => (
            <div key={p.name} className={`glass relative rounded-3xl p-7 ${p.badge === "Most Popular" ? "ring-1 ring-[var(--color-gold)]/60" : ""}`}>
              {p.badge && (
                <div className="absolute -top-3 left-6 rounded-full bg-[var(--color-gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  {p.badge}
                </div>
              )}
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="font-display text-4xl font-black">{p.price}</div>
                <div className="text-xs text-muted-foreground">once-off</div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-royal-soft)]" /> <span>{f}</span></li>
                ))}
              </ul>
              <div className="mt-5 text-xs text-muted-foreground">Timeline · {p.timeline}</div>
              <Link to="/contact" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white">
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Comparison" title={<>Feature-by-feature.</>}>
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-card/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Feature</th>
                <th className="px-5 py-4">Starter · R1,500</th>
                <th className="px-5 py-4">Business · R2,500</th>
                <th className="px-5 py-4">Premium · R5,500</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {compareRows.map((row) => (
                <tr key={row[0] as string}>
                  {row.map((cell, i) => (
                    <td key={i} className={`px-5 py-3 ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>
                      {typeof cell === "boolean" ? (
                        cell ? <Check className="h-4 w-4 text-[var(--color-royal-soft)]" /> : <X className="h-4 w-4 text-muted-foreground/50" />
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <BigCTA
        title="Pick a package. Launch in a week."
        subtitle="We'll confirm scope, send a quote, and get you live — fast."
        primary={{ label: "Start my website", to: "/contact" }}
      />
    </>
  );
}
