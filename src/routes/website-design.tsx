import { createFileRoute } from "@tanstack/react-router";

import { Section, BigCTA } from "@/components/site/ui";
import { ServiceCard } from "@/components/site/ServiceCard";
import { findCategory } from "@/lib/company";

const CAT = findCategory("website-design")!;

export const Route = createFileRoute("/website-design")({
  head: () => ({
    meta: [
      { title: "Website Design South Africa — From R1,500" },
      {
        name: "description",
        content:
          "Professional website design in South Africa from R1,500. Mobile-friendly, SEO-ready websites with WhatsApp integration, lead capture and PayFast-ready checkout.",
      },
      { property: "og:title", content: "Website Design South Africa — Hadees Trading" },
      { property: "og:description", content: "Fast, SEO-ready websites from R1,500 built to convert visitors into customers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/website-design" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/website-design" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: CAT.name,
          itemListElement: CAT.services.map((s, i) => ({
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
  component: Page,
});

function Page() {
  return (
    <>
      <Section
        as="h1"
        eyebrow="Website Design"
        title={<>Websites that win customers, not just compliments.</>}
        intro="Every site is mobile-first, fast, SEO-ready and wired to WhatsApp so enquiries reach you the moment they happen."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAT.services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>
      <BigCTA
        title="Launch in as little as 5 working days"
        subtitle="Pick a package and we'll start on your content brief today."
        primary={{ label: "Start my website", to: "/contact" }}
        secondary={{ label: "Compare packages", to: "/packages" }}
      />
    </>
  );
}
