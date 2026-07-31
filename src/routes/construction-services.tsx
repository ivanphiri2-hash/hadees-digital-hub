import { createFileRoute } from "@tanstack/react-router";

import { Section, BigCTA } from "@/components/site/ui";
import { ServiceCard } from "@/components/site/ServiceCard";
import { findCategory } from "@/lib/company";

const CAT = findCategory("construction")!;

export const Route = createFileRoute("/construction-services")({
  head: () => ({
    meta: [
      { title: "NHBRC & CIDB Registration Assistance — Contractors" },
      {
        name: "description",
        content:
          "NHBRC registration assistance, CIDB registration and upgrade assistance, health & safety files and full construction compliance packages for South African contractors.",
      },
      { property: "og:title", content: "Construction & Contractor Services — Hadees Trading" },
      { property: "og:description", content: "NHBRC and CIDB registration assistance, health & safety files and contractor compliance packages." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/construction-services" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/construction-services" }],
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
        eyebrow="Construction & Contractors"
        title={<>NHBRC, CIDB and site compliance — handled.</>}
        intro="We prepare, submit and track the registrations that let contractors work legally and bid on bigger projects across South Africa."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAT.services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>
      <BigCTA
        title="Get site- and tender-ready"
        subtitle="One team handles CIDB, COIDA, Letter of Good Standing and your health & safety file."
        primary={{ label: "Talk to a specialist", to: "/contact" }}
        secondary={{ label: "See all pricing", to: "/pricing" }}
      />
    </>
  );
}
