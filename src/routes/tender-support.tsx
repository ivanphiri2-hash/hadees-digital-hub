import { createFileRoute } from "@tanstack/react-router";

import { Section, BigCTA } from "@/components/site/ui";
import { ServiceCard } from "@/components/site/ServiceCard";
import { findCategory } from "@/lib/company";

const CAT = findCategory("tenders")!;

export const Route = createFileRoute("/tender-support")({
  head: () => ({
    meta: [
      { title: "Tender Support South Africa — Documents & Applications" },
      {
        name: "description",
        content:
          "Tender support South Africa: document review, application assistance, full tender packs, company profiles, capability statements and professional business plans.",
      },
      { property: "og:title", content: "Tender Support South Africa — Hadees Trading" },
      { property: "og:description", content: "Tender document review, application assistance and tender-ready company documents." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/tender-support" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/tender-support" }],
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
              "@type": "Service",
              name: s.name,
              description: s.desc,
              areaServed: "ZA",
              offers: { "@type": "Offer", price: s.amount, priceCurrency: "ZAR" },
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
        eyebrow="Tender Support"
        title={<>Submit tenders that actually get evaluated.</>}
        intro="Most tenders are lost on technicalities. We review, compile and package your submission so it clears compliance and competes on merit."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAT.services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>
      <BigCTA
        title="Have a tender closing soon?"
        subtitle="Send us the tender number and we'll tell you exactly what's missing."
        primary={{ label: "Get tender help", to: "/contact" }}
        secondary={{ label: "See tender services", to: "/tenders" }}
      />
    </>
  );
}
